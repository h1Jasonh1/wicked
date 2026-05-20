"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  placeOrderAction,
  validatePromoCodeAction,
} from "@/app/checkout/actions";
import { formatPrice } from "@/lib/formatters";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthPromptCard } from "@/components/auth/AuthPromptCard";
import { PayFastRedirect } from "@/components/checkout/PayFastRedirect";
import { PaymentMethods } from "@/components/ui/PaymentMethods";
import { SummaryLine } from "@/components/ui/SummaryLine";
import { useCart } from "@/hooks/useCart";
import type { PayFastSubmitPayload } from "@/lib/payfast/payload";
import type { DeliveryAddress } from "@/types/user";
import styles from "@/styles/store.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<{
  name: string;
  email: string;
  phone: string;
  addressId: string;
  cart: string;
}>;

export function CheckoutRoute() {
  const { currentUser, isAuthenticated, isAuthReady } = useAuth();
  const {
    cartItems,
    cartSubtotal,
    cartTotal,
    discountCode,
    setDiscountCode,
    shipping,
    tax,
  } = useCart();

  const addresses = currentUser?.addresses ?? [];
  const defaultAddress = useMemo(
    () => addresses.find((a) => a.isDefault) ?? addresses[0] ?? null,
    [addresses],
  );

  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [addressId, setAddressId] = useState<string | null>(
    defaultAddress?.id ?? null,
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [payfastPayload, setPayfastPayload] =
    useState<PayFastSubmitPayload | null>(null);
  const [isPending, startTransition] = useTransition();

  // Promo state — the Apply button is the only way to show a discount.
  // appliedDiscount is the validated saving (in ZAR major units); set
  // back to null when the user changes the code so we don't display
  // stale values against the new input.
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplyingPromo, startPromoTransition] = useTransition();

  // Refs for focus-on-validation. The order here is the visual order — when
  // multiple fields fail at once, we focus the first invalid one so a
  // keyboard / screen-reader user lands on the right place to correct.
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressGroupRef = useRef<HTMLDivElement>(null);

  if (!isAuthReady) {
    return (
      <main className={styles.accountPage}>
        <section className={styles.accountPanel} aria-label="Loading checkout">
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonLine} />
        </section>
      </main>
    );
  }

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

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Enter the recipient's name.";
    if (!EMAIL_REGEX.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!phone.trim()) {
      next.phone = "Enter a contact number for the courier.";
    }
    if (!addressId) {
      next.addressId =
        addresses.length === 0
          ? "Add a delivery address in your account before checking out."
          : "Select a delivery address.";
    }
    if (!cartItems.length) {
      next.cart = "Your cart is empty.";
    }
    return next;
  };

  const focusFirstError = (validation: FieldErrors) => {
    if (validation.name) {
      nameRef.current?.focus();
    } else if (validation.email) {
      emailRef.current?.focus();
    } else if (validation.phone) {
      phoneRef.current?.focus();
    } else if (validation.addressId) {
      // Focus the first radio in the address group, or the group wrapper if
      // the user has no addresses yet.
      const firstRadio = addressGroupRef.current?.querySelector<HTMLInputElement>(
        'input[type="radio"]',
      );
      (firstRadio ?? addressGroupRef.current)?.focus();
    }
  };

  const handlePlaceOrder = () => {
    const validation = validate();
    setErrors(validation);
    setSubmitError(null);
    if (Object.keys(validation).length > 0) {
      focusFirstError(validation);
      return;
    }

    startTransition(async () => {
      const result = await placeOrderAction({
        addressId: addressId ?? undefined,
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        customerName: name.trim(),
        promoCode: discountCode || undefined,
        deliveryFee: shipping,
      });

      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }

      setPayfastPayload(result.payfast);
    });
  };

  const isSubmitting = isPending || payfastPayload !== null;

  const handleApplyPromo = () => {
    setPromoError(null);
    if (!discountCode.trim()) {
      setPromoError("Enter a code to apply.");
      return;
    }
    startPromoTransition(async () => {
      const result = await validatePromoCodeAction({
        code: discountCode,
        subtotal: cartSubtotal,
      });
      if (!result.ok) {
        setAppliedDiscount(null);
        setPromoError(result.error);
        return;
      }
      setAppliedDiscount(result.discount);
    });
  };

  const handleDiscountCodeChange = (next: string) => {
    setDiscountCode(next);
    if (appliedDiscount !== null) setAppliedDiscount(null);
    if (promoError) setPromoError(null);
  };

  const displayedTotal =
    appliedDiscount !== null ? Math.max(0, cartTotal - appliedDiscount) : cartTotal;

  return (
    <main className={styles.accountPage}>
      <section className={styles.routeHeroPanel}>
        <span className={styles.eyebrow}>Checkout</span>
        <h1>Secure checkout</h1>
        <p className={styles.mutedText}>
          Pay with PayFast — your card details never touch our servers.
        </p>
      </section>

      <section className={styles.checkoutRouteGrid}>
        <div className={styles.formPanel}>
          <h2>Contact &amp; delivery</h2>
          <div className={styles.formGrid}>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>Full name</span>
              <input
                aria-describedby={errors.name ? "checkout-name-error" : undefined}
                aria-invalid={errors.name ? "true" : undefined}
                autoComplete="name"
                className={styles.input}
                onChange={(event) => setName(event.target.value)}
                placeholder="Avery Mokoena"
                ref={nameRef}
                type="text"
                value={name}
              />
              {errors.name ? (
                <small className={styles.fieldError} id="checkout-name-error">
                  {errors.name}
                </small>
              ) : null}
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input
                aria-describedby={errors.email ? "checkout-email-error" : undefined}
                aria-invalid={errors.email ? "true" : undefined}
                autoComplete="email"
                className={styles.input}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="skin@domain.com"
                ref={emailRef}
                type="email"
                value={email}
              />
              {errors.email ? (
                <small className={styles.fieldError} id="checkout-email-error">
                  {errors.email}
                </small>
              ) : null}
            </label>
            <label className={styles.field}>
              <span>Phone</span>
              <input
                aria-describedby={errors.phone ? "checkout-phone-error" : undefined}
                aria-invalid={errors.phone ? "true" : undefined}
                autoComplete="tel"
                className={styles.input}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+27 82 555 0140"
                ref={phoneRef}
                type="tel"
                value={phone}
              />
              {errors.phone ? (
                <small className={styles.fieldError} id="checkout-phone-error">
                  {errors.phone}
                </small>
              ) : null}
            </label>
          </div>

          <div className={styles.checkoutAddressSection}>
            <div className={styles.panelHeader}>
              <h2 id="checkout-address-label">Delivery address</h2>
              <Link className={styles.textButton} href="/account/settings">
                Manage in account
              </Link>
            </div>

            {addresses.length === 0 ? (
              <div className={styles.emptyState} ref={addressGroupRef} tabIndex={-1}>
                <div>
                  <h3>No saved addresses yet.</h3>
                  <p className={styles.mutedText}>
                    Add one in your account settings, then come back to finish
                    checkout.
                  </p>
                </div>
                <Link
                  className={styles.primaryButton}
                  href="/account/settings"
                >
                  Add a delivery address
                </Link>
              </div>
            ) : (
              <div
                aria-describedby={errors.addressId ? "checkout-address-error" : undefined}
                aria-labelledby="checkout-address-label"
                ref={addressGroupRef}
                role="radiogroup"
              >
                <ul className={styles.addressPickerList}>
                  {addresses.map((address) => (
                    <li key={address.id}>
                      <AddressOption
                        address={address}
                        checked={addressId === address.id}
                        onChange={() => setAddressId(address.id)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {errors.addressId ? (
              <small className={styles.fieldError} id="checkout-address-error">
                {errors.addressId}
              </small>
            ) : null}
          </div>
        </div>

        <aside className={styles.summaryPanel}>
          <h2>Order summary</h2>
          {cartItems.length ? (
            cartItems.map((item) => (
              <SummaryLine
                key={item.cartKey}
                label={`${item.name} × ${item.quantity}`}
                value={formatPrice(item.price * item.quantity)}
              />
            ))
          ) : (
            <p className={styles.mutedText}>
              Your cart is empty.{" "}
              <Link className={styles.textButton} href="/shop">
                Continue shopping
              </Link>
            </p>
          )}

          <div className={styles.field}>
            <span>Discount code</span>
            <div className={styles.promoApplyRow}>
              <input
                aria-describedby={promoError ? "checkout-promo-error" : undefined}
                aria-invalid={promoError ? "true" : undefined}
                className={styles.input}
                onChange={(event) => handleDiscountCodeChange(event.target.value)}
                placeholder="Have a promo code?"
                value={discountCode}
              />
              <button
                className={styles.secondaryButton}
                disabled={isApplyingPromo || !discountCode.trim()}
                onClick={handleApplyPromo}
                type="button"
              >
                {isApplyingPromo ? "Checking…" : "Apply"}
              </button>
            </div>
            <div aria-live="polite">
              {promoError ? (
                <small className={styles.fieldError} id="checkout-promo-error">
                  {promoError}
                </small>
              ) : appliedDiscount !== null ? (
                <small className={styles.successHint}>
                  Code applied — saving {formatPrice(appliedDiscount)}.
                </small>
              ) : null}
            </div>
          </div>

          <SummaryLine label="Subtotal" value={formatPrice(cartSubtotal)} />
          <SummaryLine
            label="Shipping"
            value={shipping ? formatPrice(shipping) : "Free"}
          />
          <SummaryLine label="VAT included" value={formatPrice(tax)} />
          {appliedDiscount !== null && appliedDiscount > 0 ? (
            <SummaryLine
              label="Discount"
              value={`-${formatPrice(appliedDiscount)}`}
            />
          ) : null}
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <strong>{formatPrice(displayedTotal)}</strong>
          </div>

          <PaymentMethods />

          {/* aria-live so screen readers hear the result of pressing Pay even
              if focus stays on the button (which it does until validation
              moves it). The role-alert wrapper handles the announcement;
              we render nothing inside it when there's nothing to say. */}
          <div aria-live="polite" role="alert">
            {submitError ? (
              <div className={styles.errorBox}>{submitError}</div>
            ) : null}
            {errors.cart ? (
              <div className={styles.errorBox}>{errors.cart}</div>
            ) : null}
          </div>

          <button
            className={styles.primaryButton}
            disabled={isSubmitting || !cartItems.length}
            onClick={handlePlaceOrder}
            type="button"
          >
            {payfastPayload
              ? "Redirecting to PayFast…"
              : isPending
                ? "Placing order…"
                : "Pay securely with PayFast"}
          </button>
          <Link className={styles.textButton} href="/account/orders">
            View past orders
          </Link>
        </aside>
      </section>

      {payfastPayload ? <PayFastRedirect payload={payfastPayload} /> : null}
    </main>
  );
}

function AddressOption({
  address,
  checked,
  onChange,
}: {
  address: DeliveryAddress;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`${styles.addressOption} ${
        checked ? styles.addressOptionSelected : ""
      }`}
    >
      <input
        checked={checked}
        name="checkout-address"
        onChange={onChange}
        type="radio"
        value={address.id}
      />
      <div>
        <strong>
          {address.label}
          {address.isDefault ? (
            <span className={styles.statusPill}>Default</span>
          ) : null}
        </strong>
        <p className={styles.mutedText}>
          {address.recipientName}
          <br />
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ""}
          <br />
          {address.city}, {address.postalCode}
          {address.province ? `, ${address.province}` : ""}
        </p>
      </div>
    </label>
  );
}
