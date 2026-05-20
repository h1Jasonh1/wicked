import "server-only";

import {
  EMAIL_FROM,
  getResendClient,
  isEmailConfigured,
} from "./client";
import {
  renderContactMessageEmail,
  type ContactMessageEmailInput,
} from "./templates/contactMessage";

const CONTACT_INBOX_EMAIL =
  process.env.CONTACT_INBOX_EMAIL ?? "wickedskincc@gmail.com";

export async function sendContactMessageEmail(
  input: ContactMessageEmailInput,
): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn(
      "[email] contact form email skipped — RESEND_API_KEY or EMAIL_FROM not set",
    );
    return;
  }

  const resend = getResendClient();
  if (!resend) return;

  const rendered = renderContactMessageEmail(input);

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: CONTACT_INBOX_EMAIL,
      // Reply-To = the visitor, so you can hit Reply in Gmail and respond
      // directly without copy-pasting their address.
      replyTo: `${input.name} <${input.email}>`,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
    if (result.error) {
      console.error("[email] Resend rejected contact form mail", {
        error: result.error,
      });
    }
  } catch (err) {
    console.error("[email] contact form send threw", { err });
  }
}
