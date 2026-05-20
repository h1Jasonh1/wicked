import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  PromoCodeRow,
} from "@/lib/supabase/database.types";

export type PromoLookupResult = {
  applied: boolean;
  /** Uppercased canonical form, present whether or not the code was valid. */
  code: string | null;
  /** ZAR discount in major units (e.g. 50 == R50.00). 0 when not applied. */
  discount: number;
  /** Friendly message for the UI when applied=false; null when applied. */
  message: string | null;
};

export type CheckoutTotals = {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
};

/**
 * Look up + validate a promo code. Used by both the server-side
 * `placeOrderAction` (defence-in-depth) and the client-facing
 * `validatePromoCodeAction` (preview before payment) so the rules can't
 * drift between the two surfaces.
 *
 * Returns a structured result rather than throwing — every code path
 * yields a stable shape the UI can render directly.
 */
export async function evaluatePromoCode(
  supabase: SupabaseClient<Database>,
  rawCode: string | undefined | null,
  subtotal: number,
): Promise<PromoLookupResult> {
  const trimmed = rawCode?.trim();
  if (!trimmed) {
    return { applied: false, code: null, discount: 0, message: null };
  }

  const code = trimmed.toUpperCase();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return {
      applied: false,
      code,
      discount: 0,
      message: "Could not validate promo code right now. Try again.",
    };
  }

  const promo = data as PromoCodeRow | null;
  if (!promo) {
    return {
      applied: false,
      code,
      discount: 0,
      message: "That promo code isn't valid.",
    };
  }

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return {
      applied: false,
      code,
      discount: 0,
      message: "That promo code has expired.",
    };
  }

  if (promo.usage_limit !== null && promo.used_count >= promo.usage_limit) {
    return {
      applied: false,
      code,
      discount: 0,
      message: "That promo code is no longer available.",
    };
  }

  const minimum = Number(promo.minimum_order_amount ?? 0);
  if (subtotal < minimum) {
    return {
      applied: false,
      code,
      discount: 0,
      message: `Spend at least ${minimum} to use this code.`,
    };
  }

  const discount =
    promo.type === "percentage"
      ? Math.round((subtotal * Number(promo.value)) / 100)
      : Math.min(subtotal, Number(promo.value));

  return { applied: true, code, discount, message: null };
}

/**
 * Single source of truth for delivery + total calculation. Free shipping
 * threshold and flat fee are env-driven (see `src/lib/checkout/config.ts`)
 * so the business can adjust without a deploy.
 */
export function calculateTotals(input: {
  subtotal: number;
  discount: number;
  deliveryFeeOverride?: number;
  freeShippingThreshold: number;
  flatShippingFee: number;
}): CheckoutTotals {
  const subtotalAfterDiscount = Math.max(0, input.subtotal - input.discount);
  const delivery =
    typeof input.deliveryFeeOverride === "number"
      ? Math.max(0, Math.round(input.deliveryFeeOverride))
      : subtotalAfterDiscount >= input.freeShippingThreshold
        ? 0
        : input.flatShippingFee;

  return {
    subtotal: input.subtotal,
    discount: input.discount,
    delivery,
    total: subtotalAfterDiscount + delivery,
  };
}
