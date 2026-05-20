"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/hooks/useCart";

/**
 * Wipes the in-memory cart once when an order is observed as paid. The
 * ITN handler clears `cart_items` server-side, but the customer's local
 * React state (and the debounced cart-write effect) would otherwise
 * re-insert the items on the very next flush. Mounting this component
 * inside the paid branch of the confirmation page makes the local state
 * agree with the database before that race can happen.
 *
 * Idempotent: keyed on `orderId` via a ref so revisits of the same paid
 * order are no-ops.
 */
export function ClearCartOnPaid({ orderId }: { orderId: string }) {
  const { clearCartLocal } = useCart();
  const clearedFor = useRef<string | null>(null);

  useEffect(() => {
    if (clearedFor.current === orderId) return;
    clearedFor.current = orderId;
    clearCartLocal();
  }, [orderId, clearCartLocal]);

  return null;
}
