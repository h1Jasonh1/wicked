"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/formatters";
import { useCart } from "@/hooks/useCart";
import { Drawer } from "@/components/ui/Drawer";
import { AuthPromptCard } from "@/components/auth/AuthPromptCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { SummaryLine } from "@/components/ui/SummaryLine";
import styles from "@/styles/store.module.css";

/**
 * Lightweight checkout preview. The real checkout (validation, address
 * picker, PayFast wiring) lives on the `/checkout` page so there's a
 * single source of truth. This drawer is just a glance + handoff.
 */
export function CheckoutDrawer() {
  const { isAuthenticated } = useAuth();
  const {
    cartItems,
    cartSubtotal,
    cartTotal,
    checkoutOpen,
    setCheckoutOpen,
    shipping,
    tax,
  } = useCart();

  if (!isAuthenticated) {
    return (
      <Drawer
        ariaLabel="Checkout sign in"
        eyebrow="Checkout"
        title="Sign in to continue"
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      >
        <AuthPromptCard
          message="Sign in to continue to checkout."
          title="Secure checkout needs an account"
          onContinueShopping={() => setCheckoutOpen(false)}
        />
      </Drawer>
    );
  }

  return (
    <Drawer
      ariaLabel="Checkout preview"
      eyebrow="Checkout"
      title="Ready to check out?"
      open={checkoutOpen}
      onClose={() => setCheckoutOpen(false)}
    >
      <div className={styles.checkoutSummary}>
        <h3>Order summary</h3>
        {cartItems.length ? (
          cartItems.map((item) => (
            <SummaryLine
              key={item.cartKey}
              label={`${item.name} × ${item.quantity}`}
              value={formatPrice(item.price * item.quantity)}
            />
          ))
        ) : (
          <p className={styles.mutedText}>Your cart is empty.</p>
        )}
        <SummaryLine label="Subtotal" value={formatPrice(cartSubtotal)} />
        <SummaryLine
          label="Shipping"
          value={shipping ? formatPrice(shipping) : "Free"}
        />
        <SummaryLine label="VAT included" value={formatPrice(tax)} />
        <div className={styles.summaryTotal}>
          <span>Total</span>
          <strong>{formatPrice(cartTotal)}</strong>
        </div>
        <Link
          aria-disabled={!cartItems.length}
          className={styles.primaryButton}
          href="/checkout"
          onClick={() => setCheckoutOpen(false)}
        >
          Continue to secure checkout
        </Link>
        <p className={styles.mutedText}>
          You will enter delivery details and pay with PayFast on the next page.
        </p>
      </div>
    </Drawer>
  );
}
