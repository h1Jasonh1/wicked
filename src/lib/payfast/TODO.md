# Checkout, Payments & Email — open items

Everything left to do for the checkout / PayFast / email flow. Grouped by urgency.
This file lives next to the PayFast code but covers the whole order pipeline.

---

## Known issues — fix before going live

These are real bugs in the current code, not future enhancements.

- [x] **Cart resyncs after PayFast clears it.** Fixed via `clearCartLocal()` exposed on the cart store and called from `<ClearCartOnPaid />` mounted in the paid branch of the confirmation page.
- [x] **Cart total can mismatch the order total.** Fixed by removing the client-side discount estimate AND adding a server-validated "Apply" button. See [src/app/checkout/actions.ts](src/app/checkout/actions.ts) `validatePromoCodeAction` + the Apply UI in [CheckoutRoute.tsx](src/components/auth/CheckoutRoute.tsx). Server still re-validates in `placeOrderAction` as defence-in-depth.
- [x] **Oversell race.** Fixed via `decrement_stock_batch` Postgres function (migration `0003_stock_decrement.sql`).
- [x] **`CheckoutDrawer` is still the old (broken) version.** Replaced its body with a slim summary + "Continue to secure checkout" link.

### Required deploy steps (apply before next deploy)

- [ ] **Apply migration `0003_stock_decrement.sql`** — `placeOrderAction` now calls `decrement_stock_batch` via RPC; without the function the action will return "Order processing is misconfigured".
- [ ] **Apply migration `0004_drop_newsletter.sql`** — drops the unused `newsletter_subscribers` table and policy. The newsletter capture surface was previously removed from the home page and the table is now dead weight.
- [ ] **Apply migration `0005_order_payment_metadata.sql`** — adds the `payment_metadata jsonb` column to `orders`. The ITN handler now writes the verified ITN payload to it for chargeback defence; without the column the update will fail.

---

## Before first sandbox test

- [ ] Add the required env vars to `.env.local`:
  - `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:3000` in dev, your domain in prod)
  - `PAYFAST_MODE=sandbox`
  - `PAYFAST_MERCHANT_ID=10000100`
  - `PAYFAST_MERCHANT_KEY=46f0cd694581a`
  - `PAYFAST_PASSPHRASE=` (leave blank for sandbox unless you've set one in the sandbox dashboard)
  - `SUPABASE_SERVICE_ROLE_KEY=...` (already needed elsewhere — required by the ITN handler)
  - `RESEND_API_KEY=...` (for order/payment-failed emails — see "Email" section below)
  - `EMAIL_FROM="SOO <orders@yourdomain.com>"` (must be a verified sender on your Resend domain)
  - `EMAIL_REPLY_TO="support@yourdomain.com"` (optional)
  - `MERCHANT_NOTIFICATION_EMAIL="ops@yourdomain.com"` (optional — receives a plain new-order notification on every paid order)
- [ ] Optional checkout pricing overrides (defaults preserve the originals: 15% VAT, R750/R95):
  - `NEXT_PUBLIC_CHECKOUT_VAT_RATE=15`
  - `NEXT_PUBLIC_CHECKOUT_FREE_SHIPPING_AT=750`
  - `NEXT_PUBLIC_CHECKOUT_FLAT_SHIPPING=95`
  - `NEXT_PUBLIC_CHECKOUT_CURRENCY=ZAR`
- [ ] Run `ngrok http 3000` (or any public tunnel). PayFast cannot reach `localhost` to deliver the ITN. Either:
  - point `NEXT_PUBLIC_SITE_URL` at the ngrok URL, **or**
  - leave `NEXT_PUBLIC_SITE_URL` as localhost and set `PAYFAST_NOTIFY_URL=https://<tunnel>/api/payfast/itn` to override just the webhook URL.
- [ ] Run the `/checkout` page through the full flow on a real mobile device (not just Chrome devtools): tap targets, keyboard behaviour on iOS Safari, autofill on Android Chrome, address-picker scrolling.
- [ ] Place a sandbox order end-to-end: confirm signature passes, ITN fires, order flips to `Paid`, cart clears, confirmation email lands, merchant notification lands.
- [ ] Test the failed-payment branch: cancel on PayFast → land on confirmation with `?payfast=cancelled` → click Retry payment → confirm new redirect uses same order. Then trigger a FAILED status (use a card PayFast sandbox declines) → confirm payment-failed email arrives.

---

## Before switching to live

- [ ] Swap `PAYFAST_MODE=live` and replace merchant_id/merchant_key with values from the PayFast merchant dashboard.
- [ ] **Always set a non-empty `PAYFAST_PASSPHRASE` in live**, and configure the matching passphrase in the PayFast dashboard. Without one, signature verification is effectively decorative.
- [ ] Run the same end-to-end test on staging using a real card and a small amount.
- [ ] Verify source-IP allowlist works in your hosting environment — `dns.lookup` must be able to resolve `www.payfast.co.za`, `w1w.payfast.co.za`, etc. (Some serverless environments restrict DNS or block outbound on certain ports.)
- [ ] Confirm `x-forwarded-for` is set correctly by your proxy/CDN. The ITN handler reads the leftmost IP — if your edge prepends instead of appends, the source-IP check will reject valid ITNs.
- [ ] Decide whether you want PayFast's customer email confirmation (currently `email_confirmation=1`) **plus** your own confirmation email, or only your own. If only your own, set it to `0` in `payload.ts`.
- [ ] Verify the Resend domain is fully authenticated (SPF + DKIM + DMARC green) — sandbox tests will land in inbox even with a half-set-up domain, but production volume will get spam-foldered.

---

## Email status

- [x] **Customer order confirmation email** — wired into ITN handler via `after()`, fires on Pending → Paid transition.
- [x] **Payment-failed email** — wired, fires on Pending → Failed transition. Includes a "Retry payment" link to the confirmation page.
- [x] **Merchant new-order notification** — wired, fires on Pending → Paid transition. Sends to `MERCHANT_NOTIFICATION_EMAIL` if configured; no-ops silently if not.
- [ ] **Resend delivery webhooks.** Resend can POST to `/api/email/webhook` on `email.delivered`, `email.bounced`, `email.complained`. Wire one up if you need to flag undeliverable customer emails (and stop sending to them).
- [ ] Track `confirmation_sent_at` on `orders` if you add an admin "resend confirmation" action — without it, double-sends would be possible.
- [ ] Switch from inline-styled HTML (in `src/lib/email/templates/*.ts`) to `react-email` if templates grow past one screen.

---

## Code improvements — optional, defer until needed

- [x] **Audit trail for chargebacks.** `payment_metadata jsonb` column added (migration `0005`). ITN handler stores the parsed verified payload.
- [x] **"Retry payment" button** on the confirmation page. Implemented via `retryPayFastForOrderAction` + `<RetryPaymentButton />` rendered in the failed/cancelled branches.
- [ ] **Cleanup job for stale Pending orders.** Anything older than 24h in `payment_status='Pending'` is almost certainly abandoned. Either a Supabase cron or a scheduled route handler that flips them to `Cancelled` AND calls `restore_stock_batch` to free the reserved inventory.
- [ ] **Proxy latency optimisation.** `proxy.ts` currently runs Supabase auth-refresh on every request including `/api/payfast/itn`. Harmless (no cookies → no work) but adds a few ms. Add `/api/payfast/itn` to the matcher's negative-lookahead if it ever shows up in latency profiling.
- [x] **Move tax + shipping rules out of code.** Now driven by `NEXT_PUBLIC_CHECKOUT_*` env vars in [src/lib/checkout/config.ts](src/lib/checkout/config.ts). Defaults preserve the original values. StoreProvider + placeOrderAction both read from the same source.

---

## Polish & a11y (before public launch)

- [x] Add a `role="alert"` + `aria-live` region to the checkout form so validation errors are announced to screen readers.
- [x] On validation failure, focus the first invalid input.
- [x] Add a visible focus ring to `.addressOption` (focus-within outline matches the keyboard focus-visible style).
- [ ] Verify the address picker is keyboard-navigable on a real device (arrow keys between radios, Space to select).
- [ ] Test the page with VoiceOver / NVDA to confirm headings + labels read sensibly in order.

---

## Tailwind migration progress

Tracked separately in [TAILWIND_MIGRATION.md](../../../TAILWIND_MIGRATION.md). Quick status:

- ✅ Phase 0 — token promotion + keyframes + component primitives (`eyebrow`, `muted-text`, `section-header`, `field`, `field-input`, `field-error`, `form-grid`, `form-actions`, `field-full`, `success-box`, `error-box`, buttons, `account-page`, `route-hero-panel`, `account-panel`, `auth-prompt-card`).
- ✅ Tier 1 (UI primitives) — `SummaryLine`, `SectionHeading`, `FormField`, `AnnouncementBar`. Skipped: `PaymentMethods` (self-contained), `BrandLogo` (deps on Navbar parent).
- ✅ Tier 2 (auth) — `AuthPromptCard`, `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `CheckEmailPanel`. Deferred: `AuthGateModal` (port with QuickViewModal in Tier 5).
- ⏸ Tier 3 (cart/checkout): `CartDrawer`, `CheckoutDrawer`, `CheckoutRoute`, `OrderTracker`, `PaymentStatusPoller`.
- ⏸ Tier 4 (account)
- ⏸ Tier 5 (product + modals)
- ⏸ Tier 6 (navigation + layout shell)
- ⏸ Tier 7 (page templates)
- ⏸ Tier 8 (static + cleanup)

---

## Out of scope — call out if requested later

- **Refunds.** PayFast has no public refund API. Refunds are processed in the merchant dashboard, then `payment_status` must be flipped to `Refunded` manually (or via an admin action). If volume grows, build an admin-only route handler that does the DB flip.
- **Multi-currency.** PayFast is ZAR-only. If you need USD/EUR later, you need a second processor (Stripe, Yoco for ZAR + USD, etc.) and a provider-routing layer.
- **Recurring billing / tokenisation.** Uses a different PayFast endpoint (ad-hoc / subscription). Not implemented.
- **3DS handling.** PayFast handles 3DS on its own hosted page; nothing to wire up. If we ever switch to Onsite Payments (modal), that changes.
- **Guest checkout.** Currently checkout requires a Supabase auth account (the gate is in `placeOrderAction`). Adding guest checkout means a separate code path that creates orders without a `user_id`, plus a "claim this order" flow if the guest later signs up.
- **Newsletter signup.** Per user direction, the newsletter table is being dropped (migration `0004`) and there is no UI surface for it.
