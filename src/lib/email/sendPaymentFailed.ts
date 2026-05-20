import "server-only";

import {
  EMAIL_FROM,
  EMAIL_REPLY_TO,
  getResendClient,
  isEmailConfigured,
} from "./client";
import { renderPaymentFailedEmail } from "./templates/paymentFailed";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { OrderRow } from "@/lib/supabase/database.types";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export async function sendPaymentFailedEmail(orderId: string): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn(
      "[email] payment-failed email skipped — RESEND_API_KEY or EMAIL_FROM not set",
      { orderId },
    );
    return;
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    console.error("[email] admin client unavailable; cannot load order", {
      orderId,
    });
    return;
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    console.error("[email] failed to load order for payment-failed mail", {
      orderId,
      error,
    });
    return;
  }

  const order = data as OrderRow;
  if (!order.customer_email) {
    console.warn("[email] order has no customer email; skipping", { orderId });
    return;
  }

  const rendered = renderPaymentFailedEmail({
    orderNumber: order.order_number,
    customerName: order.customer_name ?? "",
    total: Number(order.total),
    retryUrl: `${SITE_URL}/orders/confirmation/${order.order_number}?payfast=cancelled`,
  });

  const resend = getResendClient();
  if (!resend) return;

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: order.customer_email,
      replyTo: EMAIL_REPLY_TO,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
    if (result.error) {
      console.error("[email] Resend rejected payment-failed mail", {
        orderId,
        error: result.error,
      });
    }
  } catch (err) {
    console.error("[email] payment-failed send threw", { orderId, err });
  }
}
