import "server-only";

import { formatPrice } from "@/lib/formatters";

export type OrderConfirmationEmailInput = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: ReadonlyArray<{
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  deliveryTotal: number;
  discountTotal: number;
  total: number;
  deliveryAddress: {
    line1: string;
    line2?: string | null;
    city: string;
    postalCode: string;
    province?: string | null;
  } | null;
  trackOrderUrl: string;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

/**
 * Hand-rolled HTML — no react-email dep. Inline styles only because the
 * majority of mail clients still strip <style> blocks. Keep it simple:
 * one column, system fonts, max-width 560px.
 */
export function renderOrderConfirmationEmail(
  input: OrderConfirmationEmailInput,
): RenderedEmail {
  const subject = `Order ${input.orderNumber} confirmed`;

  const itemRows = input.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e5e5;">
            ${escape(item.name)}<br>
            <span style="color:#666;font-size:13px;">Qty ${item.quantity} &times; ${formatPrice(item.unitPrice)}</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e5e5;text-align:right;white-space:nowrap;">
            ${formatPrice(item.lineTotal)}
          </td>
        </tr>`,
    )
    .join("");

  const addressBlock = input.deliveryAddress
    ? `
      <p style="margin:0 0 4px 0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Delivery to</p>
      <p style="margin:0;line-height:1.5;">
        ${escape(input.deliveryAddress.line1)}<br>
        ${input.deliveryAddress.line2 ? `${escape(input.deliveryAddress.line2)}<br>` : ""}
        ${escape(input.deliveryAddress.city)}${
          input.deliveryAddress.province
            ? `, ${escape(input.deliveryAddress.province)}`
            : ""
        }<br>
        ${escape(input.deliveryAddress.postalCode)}
      </p>`
    : "";

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
            <td style="padding:32px 32px 8px 32px;">
              <p style="margin:0;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;">SOO</p>
              <h1 style="margin:8px 0 4px 0;font-size:22px;line-height:1.3;">Thanks${input.customerName ? `, ${escape(firstNameOf(input.customerName))}` : ""} — your order is confirmed.</h1>
              <p style="margin:8px 0 0 0;color:#666;font-size:14px;">Order ${escape(input.orderNumber)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                ${itemRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr><td style="padding:4px 0;color:#666;">Subtotal</td><td style="padding:4px 0;text-align:right;">${formatPrice(input.subtotal)}</td></tr>
                ${
                  input.discountTotal > 0
                    ? `<tr><td style="padding:4px 0;color:#666;">Discount</td><td style="padding:4px 0;text-align:right;">-${formatPrice(input.discountTotal)}</td></tr>`
                    : ""
                }
                <tr><td style="padding:4px 0;color:#666;">Delivery</td><td style="padding:4px 0;text-align:right;">${input.deliveryTotal === 0 ? "Free" : formatPrice(input.deliveryTotal)}</td></tr>
                <tr><td style="padding:8px 0 0 0;font-weight:600;border-top:1px solid #e5e5e5;">Total</td><td style="padding:8px 0 0 0;text-align:right;font-weight:600;border-top:1px solid #e5e5e5;">${formatPrice(input.total)}</td></tr>
              </table>
            </td>
          </tr>
          ${addressBlock ? `<tr><td style="padding:16px 32px;">${addressBlock}</td></tr>` : ""}
          <tr>
            <td style="padding:24px 32px 32px 32px;">
              <a href="${escape(input.trackOrderUrl)}" style="display:inline-block;background:#1a1a1a;color:#ffffff;padding:12px 20px;text-decoration:none;border-radius:8px;font-size:14px;">
                Track your order
              </a>
              <p style="margin:24px 0 0 0;color:#999;font-size:12px;">
                Reply to this email if anything looks off — we read every message.
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
    `Order ${input.orderNumber} confirmed\n\n` +
    input.items
      .map(
        (item) =>
          `${item.name} × ${item.quantity} — ${formatPrice(item.lineTotal)}`,
      )
      .join("\n") +
    `\n\nSubtotal: ${formatPrice(input.subtotal)}` +
    (input.discountTotal > 0
      ? `\nDiscount: -${formatPrice(input.discountTotal)}`
      : "") +
    `\nDelivery: ${input.deliveryTotal === 0 ? "Free" : formatPrice(input.deliveryTotal)}` +
    `\nTotal: ${formatPrice(input.total)}\n\n` +
    `Track your order: ${input.trackOrderUrl}\n`;

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
