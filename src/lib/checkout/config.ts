/**
 * Checkout pricing rules. Reads from env so business can tune without a
 * code deploy (still requires a build because Next.js bakes
 * NEXT_PUBLIC_* vars at build time). Defaults preserve the original
 * hardcoded values (15% VAT, R750 free-shipping threshold, R95 flat
 * fee, ZAR currency).
 *
 *   NEXT_PUBLIC_CHECKOUT_VAT_RATE=15            # percentage
 *   NEXT_PUBLIC_CHECKOUT_FREE_SHIPPING_AT=750   # ZAR subtotal-after-discount
 *   NEXT_PUBLIC_CHECKOUT_FLAT_SHIPPING=95       # ZAR
 *   NEXT_PUBLIC_CHECKOUT_CURRENCY=ZAR
 *
 * NEXT_PUBLIC_ prefix so the StoreProvider's client-side tax / shipping
 * estimates use the same values as the server-authoritative
 * placeOrderAction. Keep this file pure (no side effects, no Supabase)
 * so it's safe to import from anywhere.
 */

const num = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export const CHECKOUT_VAT_RATE = num("NEXT_PUBLIC_CHECKOUT_VAT_RATE", 15);
export const CHECKOUT_FREE_SHIPPING_AT = num(
  "NEXT_PUBLIC_CHECKOUT_FREE_SHIPPING_AT",
  750,
);
export const CHECKOUT_FLAT_SHIPPING = num(
  "NEXT_PUBLIC_CHECKOUT_FLAT_SHIPPING",
  95,
);
export const CHECKOUT_CURRENCY =
  process.env.NEXT_PUBLIC_CHECKOUT_CURRENCY ?? "ZAR";
