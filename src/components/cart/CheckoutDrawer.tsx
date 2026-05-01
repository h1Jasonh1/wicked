"use client";

import { formatPrice } from "@/lib/formatters";
import { useCart } from "@/hooks/useCart";
import { Icon } from "@/components/ui/Icons";
import { Drawer } from "@/components/ui/Drawer";
import { AuthPromptCard } from "@/components/auth/AuthPromptCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { PaymentMethods } from "@/components/ui/PaymentMethods";
import { SummaryLine } from "@/components/ui/SummaryLine";
import styles from "@/styles/store.module.css";

export function CheckoutDrawer() {
  const { currentUser, isAuthenticated } = useAuth();
  const {
    cartItems,
    cartSubtotal,
    cartTotal,
    checkoutOpen,
    discount,
    discountCode,
    placeOrder,
    setCheckoutOpen,
    setDiscountCode,
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
      title="Secure skincare checkout"
      open={checkoutOpen}
      onClose={() => setCheckoutOpen(false)}
    >
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
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span>Payment</span>
            <span className={styles.infoCard}>
              <Icon name="card" />
              Encrypted card entry connects here. Visa, Mastercard, Amex, and
              Apple Pay ready.
            </span>
          </label>
        </div>
      </form>
      <div className={styles.checkoutSummary}>
        <h3>Order summary</h3>
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
        {discount ? <SummaryLine label="Discount" value={`-${formatPrice(discount)}`} /> : null}
        <div className={styles.summaryTotal}>
          <span>Total</span>
          <strong>{formatPrice(cartTotal)}</strong>
        </div>
        <PaymentMethods />
        <button className={styles.primaryButton} type="button" onClick={placeOrder}>
          Place secure preview order
        </button>
      </div>
    </Drawer>
  );
}
