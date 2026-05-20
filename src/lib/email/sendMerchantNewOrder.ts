import "server-only";

import {
  EMAIL_FROM,
  EMAIL_REPLY_TO,
  getResendClient,
  isEmailConfigured,
} from "./client";
import { renderMerchantNewOrderEmail } from "./templates/merchantNewOrder";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  OrderItemRow,
  OrderRow,
} from "@/lib/supabase/database.types";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const MERCHANT_NOTIFICATION_EMAIL = process.env.MERCHANT_NOTIFICATION_EMAIL ?? "";

/**
 * Notify the business of a new paid order. Set MERCHANT_NOTIFICATION_EMAIL
 * in env to enable; without it, the function logs and returns. Uses the
 * same Resend client + sender as customer email.
 */
export async function sendMerchantNewOrderEmail(orderId: string): Promise<void> {
  if (!isEmailConfigured()) return;
  if (!MERCHANT_NOTIFICATION_EMAIL) return;

  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    console.error("[email] failed to load order for merchant notification", {
      orderId,
      error,
    });
    return;
  }

  const order = data as unknown as OrderRow & { order_items: OrderItemRow[] };

  const itemSummary = order.order_items
    .map((item) => `${item.quantity}× ${item.product_name}`)
    .join(", ");

  const rendered = renderMerchantNewOrderEmail({
    orderNumber: order.order_number,
    customerName: order.customer_name ?? "Unknown customer",
    customerEmail: order.customer_email ?? "(no email)",
    customerPhone: order.customer_phone,
    itemSummary,
    total: Number(order.total),
    adminUrl: `${SITE_URL}/account/orders/${order.id}`,
  });

  const resend = getResendClient();
  if (!resend) return;

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: MERCHANT_NOTIFICATION_EMAIL,
      replyTo: EMAIL_REPLY_TO,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
    if (result.error) {
      console.error("[email] Resend rejected merchant notification", {
        orderId,
        error: result.error,
      });
    }
  } catch (err) {
    console.error("[email] merchant notification send threw", { orderId, err });
  }
}
