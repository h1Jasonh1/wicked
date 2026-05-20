import "server-only";

/**
 * PayFast credentials. Sandbox defaults are PayFast's published test merchant
 * (10000100 / 46f0cd694581a) — anything more sensitive lives in env vars.
 *
 * Set in .env.local:
 *   PAYFAST_MODE=sandbox        # or 'live'
 *   PAYFAST_MERCHANT_ID=...
 *   PAYFAST_MERCHANT_KEY=...
 *   PAYFAST_PASSPHRASE=...      # optional but strongly recommended in live
 *   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
 *   PAYFAST_NOTIFY_URL=...      # optional override (use during dev with ngrok)
 */

export type PayFastMode = "sandbox" | "live";

export const PAYFAST_MODE: PayFastMode =
  process.env.PAYFAST_MODE === "live" ? "live" : "sandbox";

export const PAYFAST_MERCHANT_ID =
  process.env.PAYFAST_MERCHANT_ID ?? "10000100";
export const PAYFAST_MERCHANT_KEY =
  process.env.PAYFAST_MERCHANT_KEY ?? "46f0cd694581a";
export const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE ?? "";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const PAYFAST_PROCESS_URL =
  PAYFAST_MODE === "live"
    ? "https://www.payfast.co.za/eng/process"
    : "https://sandbox.payfast.co.za/eng/process";

export const PAYFAST_VALIDATE_URL =
  PAYFAST_MODE === "live"
    ? "https://www.payfast.co.za/eng/query/validate"
    : "https://sandbox.payfast.co.za/eng/query/validate";

/**
 * Hostnames PayFast posts ITNs from. Resolved to IPs at runtime so we don't
 * hard-code an allowlist that PayFast might rotate.
 */
export const PAYFAST_NOTIFY_HOSTS =
  PAYFAST_MODE === "live"
    ? [
        "www.payfast.co.za",
        "w1w.payfast.co.za",
        "w2w.payfast.co.za",
        "sw1w.payfast.co.za",
        "sw2w.payfast.co.za",
      ]
    : ["sandbox.payfast.co.za"];

export function buildReturnUrl(orderNumber: string): string {
  return `${SITE_URL}/orders/confirmation/${orderNumber}?payfast=success`;
}

export function buildCancelUrl(orderNumber: string): string {
  return `${SITE_URL}/orders/confirmation/${orderNumber}?payfast=cancelled`;
}

export function buildNotifyUrl(): string {
  return process.env.PAYFAST_NOTIFY_URL ?? `${SITE_URL}/api/payfast/itn`;
}
