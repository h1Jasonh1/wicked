import "server-only";

import {
  EMAIL_FROM,
  EMAIL_REPLY_TO,
  getResendClient,
  isEmailConfigured,
} from "./client";
import { renderOrderConfirmationEmail } from "./templates/orderConfirmation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  OrderItemRow,
  OrderRow,
} from "@/lib/supabase/database.types";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/**
 * Send the order confirmation email for a paid order. Designed to be
 * called from the ITN handler via `after()` — never throws and never
 * blocks the response. All failures are logged for ops to follow up on.
 *
 * Idempotency: the ITN handler already only fires this on the first
 * Pending → Paid transition, so duplicate sends are not a concern in
 * normal operation. If you later add an admin "resend confirmation"
 * action, gate it on a separate `confirmation_sent_at` column.
 */
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn(
      "[email] order confirmation skipped — RESEND_API_KEY or EMAIL_FROM not set",
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
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    console.error("[email] failed to load order for confirmation", {
      orderId,
      error,
    });
    return;
  }

  // Hand-rolled Database type doesn't model the order_items relation
  // expressed by the embedded select, so route through unknown.
  const order = data as unknown as OrderRow & { order_items: OrderItemRow[] };

  if (!order.customer_email) {
    console.warn("[email] order has no customer email; skipping", { orderId });
    return;
  }

  const address = (order.delivery_address ?? null) as
    | {
        address_line_1?: string;
        address_line_2?: string;
        city?: string;
        province?: string;
        postal_code?: string;
      }
    | null;

  const rendered = renderOrderConfirmationEmail({
    orderNumber: order.order_number,
    customerName: order.customer_name ?? "",
    customerEmail: order.customer_email,
    items: order.order_items.map((item) => ({
      name: item.product_name,
      quantity: item.quantity,
      unitPrice: Number(item.product_price),
      lineTotal: Number(item.total),
    })),
    subtotal: Number(order.subtotal),
    deliveryTotal: Number(order.delivery_total),
    discountTotal: Number(order.discount_total),
    total: Number(order.total),
    deliveryAddress:
      address && address.address_line_1 && address.city && address.postal_code
        ? {
            line1: address.address_line_1,
            line2: address.address_line_2 ?? null,
            city: address.city,
            postalCode: address.postal_code,
            province: address.province ?? null,
          }
        : null,
    trackOrderUrl: `${SITE_URL}/account/orders/${order.id}`,
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
      console.error("[email] Resend rejected order confirmation", {
        orderId,
        error: result.error,
      });
    }
  } catch (err) {
    console.error("[email] order confirmation send threw", { orderId, err });
  }
}
