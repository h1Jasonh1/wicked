import "server-only";

import type { RenderedEmail } from "./orderConfirmation";

export type ContactMessageEmailInput = {
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  orderReference: string | null;
  message: string;
  submittedAt: Date;
};

export function renderContactMessageEmail(
  input: ContactMessageEmailInput,
): RenderedEmail {
  const subjectLine = input.subject ? ` — ${input.subject}` : "";
  const subject = `Contact form: ${input.name}${subjectLine}`;

  const rows: Array<[string, string]> = [
    ["From", `${input.name} <${input.email}>`],
  ];
  if (input.phone) rows.push(["Phone", input.phone]);
  if (input.subject) rows.push(["Subject", input.subject]);
  if (input.orderReference) rows.push(["Order ref", input.orderReference]);
  rows.push(["Submitted", input.submittedAt.toISOString()]);

  const metaHtml = rows
    .map(
      ([k, v]) =>
        `<p style="margin:0 0 6px 0;"><strong>${escape(k)}:</strong> ${escape(v)}</p>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
  <table role="presentation" cellspacing="0" cellpadding="0" style="max-width:560px;">
    <tr><td>
      <h1 style="margin:0 0 16px 0;font-size:20px;">New contact form submission</h1>
      ${metaHtml}
      <p style="margin:20px 0 8px 0;"><strong>Message:</strong></p>
      <p style="margin:0;white-space:pre-wrap;color:#222;">${escape(input.message)}</p>
    </td></tr>
  </table>
</body>
</html>`;

  const text =
    `New contact form submission\n\n` +
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    `\n\nMessage:\n${input.message}\n`;

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
