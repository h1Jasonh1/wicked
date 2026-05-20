import "server-only";

import { formatPrice } from "@/lib/formatters";
import type { RenderedEmail } from "./orderConfirmation";

export type MerchantNewOrderEmailInput = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  itemSummary: string;
  total: number;
  adminUrl: string;
};

/**
 * Plaintext-leaning email to the merchant whenever a new order is paid.
 * No styling theatrics — the recipient is the business, not the
 * customer. Includes everything they need to start fulfillment.
 */
export function renderMerchantNewOrderEmail(
  input: MerchantNewOrderEmailInput,
): RenderedEmail {
  const subject = `New order ${input.orderNumber} — ${formatPrice(input.total)}`;

  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
  <table role="presentation" cellspacing="0" cellpadding="0" style="max-width:560px;">
    <tr><td>
      <h1 style="margin:0 0 16px 0;font-size:20px;">New order: ${escape(input.orderNumber)}</h1>
      <p style="margin:0 0 8px 0;"><strong>Total:</strong> ${formatPrice(input.total)}</p>
      <p style="margin:0 0 8px 0;"><strong>Customer:</strong> ${escape(input.customerName)} &lt;${escape(input.customerEmail)}&gt;</p>
      ${input.customerPhone ? `<p style="margin:0 0 8px 0;"><strong>Phone:</strong> ${escape(input.customerPhone)}</p>` : ""}
      <p style="margin:16px 0 8px 0;"><strong>Items:</strong></p>
      <p style="margin:0 0 16px 0;color:#444;">${escape(input.itemSummary)}</p>
      <p style="margin:24px 0 0 0;">
        <a href="${escape(input.adminUrl)}">Open in admin</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`;

  const text =
    `New order: ${input.orderNumber}\n` +
    `Total: ${formatPrice(input.total)}\n` +
    `Customer: ${input.customerName} <${input.customerEmail}>\n` +
    (input.customerPhone ? `Phone: ${input.customerPhone}\n` : "") +
    `Items: ${input.itemSummary}\n\n` +
    `Open: ${input.adminUrl}\n`;

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
