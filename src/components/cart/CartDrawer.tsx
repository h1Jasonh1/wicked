"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/formatters";
import { useCart } from "@/hooks/useCart";
import { Icon } from "@/components/ui/Icons";
import { Drawer } from "@/components/ui/Drawer";
import { SummaryLine } from "@/components/ui/SummaryLine";
import { ProductVisual } from "@/components/product/ProductCard";
import { AuthPromptCard } from "@/components/auth/AuthPromptCard";
import styles from "@/styles/store.module.css";

export function CartDrawer() {
  const {
    cartItems,
    cartAccountPromptVisible,
    cartOpen,
    cartSubtotal,
    cartTotal,
    discount,
    dismissCartAccountPrompt,
    removeCartItem,
    setCartOpen,
    shipping,
    startCheckout,
    tax,
    updateCartQuantity,
  } = useCart();

  return (
    <Drawer
      ariaLabel="Cart"
      eyebrow="Cart"
      title="Your selection"
      open={cartOpen}
      onClose={() => setCartOpen(false)}
    >
      <div className={styles.drawerItems}>
        {cartItems.length ? (
          cartItems.map((item) => (
            <article className={styles.drawerItem} key={item.cartKey}>
              <div className={styles.drawerThumb}>
                <ProductVisual product={item} compact />
              </div>
              <div>
                <h3>{item.name}</h3>
                <small>
                  {formatPrice(item.price)}
                  {item.selectedVariant ? ` / ${item.selectedVariant}` : ""}
                  {item.selectedSize ? ` / ${item.selectedSize}` : ""}
                </small>
                <div className={styles.heroActions}>
                  <div className={styles.quantity} aria-label={`Quantity for ${item.name}`}>
                    <button
                      type="button"
                      aria-label={`Decrease ${item.name} quantity`}
                      onClick={() => updateCartQuantity(item.cartKey, -1)}
                    >
                      <Icon name="minus" />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase ${item.name} quantity`}
                      onClick={() => updateCartQuantity(item.cartKey, 1)}
                    >
                      <Icon name="plus" />
                    </button>
                  </div>
                  <button
                    className={styles.textButton}
                    type="button"
                    onClick={() => removeCartItem(item.cartKey)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div>
              <h3>Your cart is empty.</h3>
              <p className={styles.mutedText}>
                Start with one WICKED essential. Totals, delivery, and VAT stay
                clear before checkout.
              </p>
            </div>
          </div>
        )}
      </div>
      {cartItems.length && cartAccountPromptVisible ? (
        <AuthPromptCard
          compact
          onAuthenticated={dismissCartAccountPrompt}
          onContinueShopping={() => {
            dismissCartAccountPrompt();
            setCartOpen(false);
          }}
        />
      ) : null}
      <div className={styles.drawerFooter}>
        <p className={styles.mutedText}>
          Free South Africa delivery applies above R750.
        </p>
        <SummaryLine label="Subtotal" value={formatPrice(cartSubtotal)} />
        <SummaryLine
          label="Shipping"
          value={shipping ? formatPrice(shipping) : "Free"}
        />
        <SummaryLine label="VAT included" value={formatPrice(tax)} />
        {discount ? (
          <SummaryLine label="WICKED code" value={`-${formatPrice(discount)}`} />
        ) : null}
        <div className={styles.summaryTotal}>
          <span>Total</span>
          <strong>{formatPrice(cartTotal)}</strong>
        </div>
        <button className={styles.primaryButton} type="button" onClick={startCheckout}>
          Enter secure checkout
        </button>
        <Link
          className={styles.secondaryButton}
          href="/shop"
          onClick={() => setCartOpen(false)}
        >
          Continue shopping
        </Link>
      </div>
    </Drawer>
  );
}
