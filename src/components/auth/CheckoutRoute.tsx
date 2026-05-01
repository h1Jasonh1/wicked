"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/formatters";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthPromptCard } from "@/components/auth/AuthPromptCard";
import { PaymentMethods } from "@/components/ui/PaymentMethods";
import { SummaryLine } from "@/components/ui/SummaryLine";
import { useCart } from "@/hooks/useCart";
import styles from "@/styles/store.module.css";

export function CheckoutRoute() {
  const { currentUser, isAuthenticated } = useAuth();
  const {
    cartItems,
    cartSubtotal,
    cartTotal,
    discount,
    discountCode,
    placeOrder,
    setDiscountCode,
    shipping,
    tax,
  } = useCart();

  if (!isAuthenticated) {
    return (
      <main className={styles.accountPage}>
        <AuthPromptCard
          message="Sign in to continue to checkout."
          title="Secure checkout needs an account"
        />
      </main>
    );
  }

  return (
    <main className={styles.accountPage}>
      <section className={styles.routeHeroPanel}>
        <span className={styles.eyebrow}>Checkout</span>
        <h1>Secure checkout preview</h1>
        <p className={styles.mutedText}>
          Signed in as {currentUser?.email}. Payment and order creation are
          placeholders until a real payment and order backend is connected.
        </p>
      </section>
      <section className={styles.checkoutRouteGrid}>
        <form className={styles.formPanel}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Email</span>
              <input
                className={styles.input}
                type="email"
                placeholder="skin@domain.com"
                defaultValue={currentUser?.email}
              />
            </label>
            <label className={styles.field}>
              <span>Phone</span>
              <input
                className={styles.input}
                type="tel"
                placeholder="+27 82 555 0140"
                defaultValue={currentUser?.phone}
              />
            </label>
            <label className={styles.field}>
              <span>Full name</span>
              <input
                className={styles.input}
                type="text"
                placeholder="Avery Mokoena"
                defaultValue={currentUser?.name}
              />
            </label>
            <label className={styles.field}>
              <span>Postcode</span>
              <input className={styles.input} type="text" placeholder="8001" />
            </label>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>Address</span>
              <input
                className={styles.input}
                type="text"
                placeholder="18 Bree Street, Cape Town"
                defaultValue={currentUser?.addresses[0]?.line1}
              />
            </label>
          </div>
        </form>
        <aside className={styles.summaryPanel}>
          <h2>Order summary</h2>
          {cartItems.length ? (
            cartItems.map((item) => (
              <SummaryLine
                key={item.cartKey}
                label={`${item.name} x ${item.quantity}`}
                value={formatPrice(item.price * item.quantity)}
              />
            ))
          ) : (
            <p className={styles.mutedText}>Your cart is empty.</p>
          )}
          <label className={styles.field}>
            <span>Discount code</span>
            <input
              className={styles.input}
              value={discountCode}
              placeholder="Try WICKED10"
              onChange={(event) => setDiscountCode(event.target.value)}
            />
          </label>
          <SummaryLine label="Subtotal" value={formatPrice(cartSubtotal)} />
          <SummaryLine
            label="Shipping"
            value={shipping ? formatPrice(shipping) : "Free"}
          />
          <SummaryLine label="VAT included" value={formatPrice(tax)} />
          {discount ? (
            <SummaryLine label="Discount" value={`-${formatPrice(discount)}`} />
          ) : null}
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>
          <PaymentMethods />
          <button className={styles.primaryButton} type="button" onClick={placeOrder}>
            Place secure preview order
          </button>
          <Link className={styles.textButton} href="/orders/confirmation">
            View confirmation placeholder
          </Link>
        </aside>
      </section>
    </main>
  );
}
