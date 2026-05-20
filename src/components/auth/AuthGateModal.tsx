"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import type { AuthGate } from "@/types/cart";
import { useCartStore } from "@/store/StoreProvider";
import { writePendingAuthGate } from "@/lib/auth-gate";
import { useUIStore } from "@/store/StoreProvider";
import { useCatalog } from "@/components/catalog/CatalogProvider";
import { Icon } from "@/components/ui/Icons";
import styles from "@/styles/store.module.css";

/**
 * Auth gate that surfaces when a guest tries to add to cart or save a
 * wishlist item. Two variants:
 *
 *  - kind: "cart"     -> headline "Almost there — save your cart!", three
 *    CTAs (Create Free Account, Log In, Continue as Guest). The guest
 *    path completes the underlying add — the backend merges this cart
 *    into the account on a later sign-in.
 *
 *  - kind: "wishlist" -> headline "Don't lose this one!", two CTAs only
 *    (Create Free Account, Log In). Wishlist is account-only — there is
 *    no guest path, the action is blocked until auth.
 *
 * On dismiss the gate clears without persisting anything in the guest
 * session. Tapping a CTA stashes the pending action in sessionStorage so
 * AuthProvider can replay it once the visitor finishes signing in.
 */
export function AuthGateModal() {
  const { authGate, dismissAuthGate } = useUIStore();
  const { addToCart } = useCartStore();
  const { productsById } = useCatalog();
  const pathname = usePathname() ?? "/";

  // Close on Escape — matches drawer behaviour.
  useEffect(() => {
    if (!authGate) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissAuthGate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authGate, dismissAuthGate]);

  const continueAsGuest = useCallback(() => {
    if (!authGate || authGate.kind !== "cart") return;
    const product = productsById.get(authGate.productId);
    dismissAuthGate();
    if (!product) return;
    // Guest path completes the original add — cart merges on sign-in,
    // so the user's selection isn't lost when they eventually sign up.
    addToCart(product, authGate.quantity, authGate.options);
  }, [addToCart, authGate, dismissAuthGate, productsById]);

  const stashAndRoute = useCallback(
    (gate: AuthGate) => {
      writePendingAuthGate(gate);
    },
    [],
  );

  const next = encodeURIComponent(pathname);
  const open = Boolean(authGate);

  return (
    <div
      className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`}
      aria-hidden={!open}
    >
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Close auth prompt"
        onClick={dismissAuthGate}
      />
      {authGate ? (
        <section
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-gate-title"
          aria-describedby="auth-gate-subtext"
        >
          <button
            className={styles.quickClose}
            type="button"
            aria-label="Close"
            onClick={dismissAuthGate}
          >
            <Icon name="close" />
          </button>
          <span className={styles.eyebrow}>
            {authGate.kind === "cart" ? "Save your cart" : "Save to wishlist"}
          </span>
          <h2 id="auth-gate-title" className={styles.productTitle}>
            {authGate.kind === "cart"
              ? "Almost there — save your cart!"
              : "Don’t lose this one!"}
          </h2>
          <p id="auth-gate-subtext" className={styles.mutedText}>
            {authGate.kind === "cart"
              ? `Create a free account or log in to keep ${authGate.productName} in your cart and check out faster.`
              : `Sign in or create an account to save ${authGate.productName} to your wishlist and access it anytime.`}
          </p>

          <div className={styles.formActions}>
            <Link
              className={styles.primaryButton}
              href={`/auth/register?next=${next}`}
              onClick={() => stashAndRoute(authGate)}
            >
              Create Free Account
            </Link>
            <Link
              className={styles.secondaryButton}
              href={`/auth/login?next=${next}`}
              onClick={() => stashAndRoute(authGate)}
            >
              Log In
            </Link>
          </div>

          {authGate.kind === "cart" ? (
            <button
              className={styles.textButton}
              type="button"
              onClick={continueAsGuest}
            >
              Continue as Guest
            </button>
          ) : null}

          <p className={styles.mutedText}>
            Your item will be saved automatically once you sign in.
            {authGate.kind === "cart"
              ? " If you log in later, your cart will be saved."
              : ""}
          </p>
        </section>
      ) : null}
    </div>
  );
}
