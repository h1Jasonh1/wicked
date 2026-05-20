import "server-only";

import { createHash } from "node:crypto";

/**
 * PayFast signature.
 *
 * PayFast specifies its own urlencode contract: identical to PHP's urlencode()
 * (spaces as '+', not '%20'; uppercase hex). We compute exactly that — using
 * encodeURIComponent and swapping '%20' to '+' — over the field list in the
 * order PayFast received them, with `signature` excluded and the optional
 * passphrase appended last.
 *
 * The byte-for-byte order matters: a Map preserves insertion order, an object
 * does not for numeric keys. Always pass an ordered tuple list.
 */
export type PayFastField = readonly [key: string, value: string];

function payfastEncode(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

export function signPayFastFields(
  fields: readonly PayFastField[],
  passphrase: string,
): string {
  const parts: string[] = [];
  for (const [key, value] of fields) {
    if (key === "signature") continue;
    if (value === undefined || value === null || value === "") continue;
    parts.push(`${key}=${payfastEncode(value)}`);
  }

  let signatureBase = parts.join("&");
  if (passphrase) {
    signatureBase += `&passphrase=${payfastEncode(passphrase)}`;
  }

  return createHash("md5").update(signatureBase).digest("hex");
}

/**
 * Verify an ITN signature. Iterate the params in their received order so the
 * signature base matches what PayFast computed on their end.
 */
export function verifyPayFastSignature(
  params: URLSearchParams,
  expectedSignature: string,
  passphrase: string,
): boolean {
  const fields: PayFastField[] = [];
  for (const [key, value] of params.entries()) {
    if (key === "signature") continue;
    fields.push([key, value]);
  }
  const computed = signPayFastFields(fields, passphrase);
  return timingSafeEqualHex(computed, expectedSignature.toLowerCase());
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
