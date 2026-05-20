import "server-only";

import { Resend } from "resend";

/**
 * Resend client. Returns null when not configured so callers can no-op
 * cleanly in dev / preview environments without hard-failing the order
 * flow. The ITN handler must never throw because email sending failed —
 * the order is already paid.
 */

let cached: Resend | null | undefined;

export function getResendClient(): Resend | null {
  if (cached !== undefined) return cached;
  const apiKey = process.env.RESEND_API_KEY;
  cached = apiKey ? new Resend(apiKey) : null;
  return cached;
}

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "";
export const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO ?? undefined;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY) && EMAIL_FROM.length > 0;
}
