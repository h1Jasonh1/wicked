import "server-only";

import { promises as dns } from "node:dns";
import {
  PAYFAST_NOTIFY_HOSTS,
  PAYFAST_PASSPHRASE,
  PAYFAST_VALIDATE_URL,
} from "./env";
import { verifyPayFastSignature } from "./sign";

export type ItnVerifyResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Full PayFast ITN verification per their integration guide:
 *   1. md5 signature check (with passphrase if configured)
 *   2. source IP must resolve from a known PayFast hostname
 *   3. server-to-server POST back to PayFast — the body must come back "VALID"
 *
 * Each check is independent; we run them in order, cheapest first, and bail
 * on the first failure with a reason for the log.
 */
export async function verifyItn(
  rawBody: string,
  params: URLSearchParams,
  sourceIp: string | null,
): Promise<ItnVerifyResult> {
  const signature = params.get("signature");
  if (!signature) return { ok: false, reason: "missing signature" };

  if (!verifyPayFastSignature(params, signature, PAYFAST_PASSPHRASE)) {
    return { ok: false, reason: "signature mismatch" };
  }

  const ipOk = await isPayFastSourceIp(sourceIp);
  if (!ipOk) {
    return { ok: false, reason: `source ip not in PayFast allowlist: ${sourceIp}` };
  }

  const validateOk = await postBackForValidation(rawBody);
  if (!validateOk) {
    return { ok: false, reason: "server-to-server validate did not return VALID" };
  }

  return { ok: true };
}

async function isPayFastSourceIp(sourceIp: string | null): Promise<boolean> {
  if (!sourceIp) return false;
  const normalized = sourceIp.replace(/^::ffff:/, "");

  const lookups = await Promise.all(
    PAYFAST_NOTIFY_HOSTS.map(async (host) => {
      try {
        const records = await dns.lookup(host, { all: true });
        return records.map((r) => r.address);
      } catch {
        return [] as string[];
      }
    }),
  );

  const allowed = new Set(lookups.flat());
  return allowed.has(normalized);
}

async function postBackForValidation(rawBody: string): Promise<boolean> {
  // The spec is to send back the EXACT body PayFast sent us — same encoding,
  // same field order — and check the response equals "VALID".
  try {
    const response = await fetch(PAYFAST_VALIDATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: rawBody,
    });
    if (!response.ok) return false;
    const text = (await response.text()).trim().toUpperCase();
    return text === "VALID";
  } catch {
    return false;
  }
}
