import { headers } from "next/headers";
import { after } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyItn } from "@/lib/payfast/verify";
import { sendOrderConfirmation } from "@/lib/email/sendOrderConfirmation";
import { sendPaymentFailedEmail } from "@/lib/email/sendPaymentFailed";
import { sendMerchantNewOrderEmail } from "@/lib/email/sendMerchantNewOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PayFast Instant Transaction Notification (ITN) handler.
 *
 * Always returns 200 to PayFast — even when we reject the notification —
 * because PayFast retries on non-2xx and we don't want a poisoned ITN to
 * loop forever. We log every rejection for ops visibility.
 *
 * Idempotent: PayFast sends each ITN at least once and may retry. Once an
 * order is "Paid", subsequent ITNs are no-ops.
 */
export async function POST(request: Request) {
  // Raw body is required twice: for signature verification (must iterate the
  // exact key order PayFast sent) and for the server-to-server validate
  // post-back (PayFast wants the bytes back unmodified).
  const rawBody = await request.text();
  const params = new URLSearchParams(rawBody);

  const sourceIp = await readSourceIp();
  const verification = await verifyItn(rawBody, params, sourceIp);
  if (!verification.ok) {
    console.warn("[payfast/itn] rejected:", verification.reason, {
      m_payment_id: params.get("m_payment_id"),
      pf_payment_id: params.get("pf_payment_id"),
    });
    return new Response("OK", { status: 200 });
  }

  const orderId = params.get("m_payment_id");
  const pfPaymentId = params.get("pf_payment_id");
  const paymentStatus = params.get("payment_status");
  const amountGross = params.get("amount_gross");

  if (!orderId || !paymentStatus || !amountGross) {
    console.warn("[payfast/itn] missing required fields", {
      orderId,
      paymentStatus,
      amountGross,
    });
    return new Response("OK", { status: 200 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    console.error("[payfast/itn] admin client unavailable — service role key missing");
    return new Response("OK", { status: 200 });
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, total, currency, payment_status, status")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    console.warn("[payfast/itn] order not found", { orderId, orderError });
    return new Response("OK", { status: 200 });
  }

  // Amount-tampering check — PayFast lets the merchant override, so we always
  // compare what they tell us against what we recorded server-side.
  const expected = Number(order.total).toFixed(2);
  const received = Number(amountGross).toFixed(2);
  if (expected !== received) {
    console.error("[payfast/itn] amount mismatch", {
      orderId,
      expected,
      received,
    });
    return new Response("OK", { status: 200 });
  }

  // Idempotency: if we've already settled this order, drop the duplicate.
  if (order.payment_status === "Paid" && paymentStatus === "COMPLETE") {
    return new Response("OK", { status: 200 });
  }

  const next = mapStatus(paymentStatus, order.status);

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: next.paymentStatus,
      status: next.orderStatus,
      payment_provider: "payfast",
      payment_reference: pfPaymentId,
      // Snapshot the verified ITN payload for chargeback defense. Stored
      // as the parsed key/value pairs (not the raw urlencoded body) so
      // it's queryable in SQL later.
      payment_metadata: Object.fromEntries(params),
    })
    .eq("id", orderId);

  if (updateError) {
    console.error("[payfast/itn] failed to update order", {
      orderId,
      updateError,
    });
    return new Response("OK", { status: 200 });
  }

  // Clear the cart only on successful payment. Cancellations / failures leave
  // the cart intact so the customer can retry without re-adding products.
  if (next.paymentStatus === "Paid") {
    const { error: cartError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", order.user_id);
    if (cartError) {
      console.warn("[payfast/itn] failed to clear cart", {
        userId: order.user_id,
        cartError,
      });
    }

    // Customer confirmation + merchant notification both run after the
    // response so a slow Resend call doesn't make PayFast time out and
    // retry the ITN. Each one no-ops gracefully if Resend isn't
    // configured.
    after(() => sendOrderConfirmation(orderId));
    after(() => sendMerchantNewOrderEmail(orderId));
  } else if (next.paymentStatus === "Failed") {
    // Payment was attempted and rejected — let the customer know so
    // they're not left wondering. Cart is still intact for retry.
    after(() => sendPaymentFailedEmail(orderId));
  }

  return new Response("OK", { status: 200 });
}

function mapStatus(
  payfastStatus: string,
  currentOrderStatus: string,
): { paymentStatus: string; orderStatus: string } {
  switch (payfastStatus) {
    case "COMPLETE":
      return { paymentStatus: "Paid", orderStatus: "Payment Confirmed" };
    case "FAILED":
      return { paymentStatus: "Failed", orderStatus: currentOrderStatus };
    case "PENDING":
      return { paymentStatus: "Pending", orderStatus: currentOrderStatus };
    default:
      return { paymentStatus: "Pending", orderStatus: currentOrderStatus };
  }
}

async function readSourceIp(): Promise<string | null> {
  const headerStore = await headers();
  // x-forwarded-for is a comma-separated chain "client, proxy1, proxy2".
  // PayFast's request is the leftmost (the original client).
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return headerStore.get("x-real-ip");
}
