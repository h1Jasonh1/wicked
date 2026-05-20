import "server-only";

import { formatPrice } from "@/lib/formatters";
import type { RenderedEmail } from "./orderConfirmation";

export type PaymentFailedEmailInput = {
  orderNumber: string;
  customerName: string;
  total: number;
  retryUrl: string;
};

/**
 * Hand-rolled HTML — same minimal styling contract as the order
 * confirmation email. Sent when PayFast reports payment_status=FAILED
 * so the customer doesn't sit wondering whether the order completed.
 */
export function renderPaymentFailedEmail(
  input: PaymentFailedEmailInput,
): RenderedEmail {
  const subject = `Payment couldn't be processed for order ${input.orderNumber}`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escape(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f4;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:32px;">
              <p style="margin:0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;">SOO</p>
              <h1 style="margin:8px 0 4px 0;font-size:22px;line-height:1.3;">Hi${input.customerName ? ` ${escape(firstNameOf(input.customerName))}` : ""} — your payment didn't go through.</h1>
              <p style="margin:8px 0 0 0;color:#666;font-size:14px;">Order ${escape(input.orderNumber)} · ${formatPrice(input.total)}</p>
              <p style="margin:24px 0 0 0;line-height:1.5;">
                We received notice from our payment processor that the charge for your order didn't complete. Your card was not billed and your items are still reserved for you.
              </p>
              <p style="margin:24px 0 0 0;">
                <a href="${escape(input.retryUrl)}" style="display:inline-block;background:#1a1a1a;color:#ffffff;padding:12px 20px;text-decoration:none;border-radius:8px;font-size:14px;">
                  Retry payment
                </a>
              </p>
              <p style="margin:24px 0 0 0;color:#999;font-size:12px;">
                If this keeps happening, reply to this email and we'll help sort it out.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text =
    `Payment couldn't be processed for order ${input.orderNumber}\n\n` +
    `Total: ${formatPrice(input.total)}\n` +
    `Your card was not charged. Your items are still reserved.\n\n` +
    `Retry payment: ${input.retryUrl}\n`;

  return { subject, html, text };
}

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}
