# Tailwind migration plan

Moving from a single 4,223-line `store.module.css` (CSS Modules) to Tailwind v4
utility classes, component-by-component, preserving exact visual output.

## What we're starting from

- **Tailwind v4 is already installed and partially wired.** `src/app/globals.css`
  uses `@import "tailwindcss"` and a `@theme inline` block with 4 tokens
  (background, foreground, fonts). `src/app/layout.tsx` uses Tailwind classes on
  `<html>` and `<body>`. Nothing else.
- **Everything else uses CSS Modules.** One file: `src/styles/store.module.css`,
  4,223 lines, 727 `styles.X` references across 54 files.
- **Design tokens live on the `.shell` class**, not `:root` — the `--auren-*`
  variables are scoped to the AppShell wrapper. Promoting them to global is
  step zero, otherwise Tailwind can't reference them.
- **Tailwind v4 prefers CSS-first config** via the `@theme` directive in
  `globals.css`. We will not introduce `tailwind.config.ts`.

## End-state target

- `src/styles/store.module.css` deleted.
- `src/app/globals.css` holds the full design-token system under `@theme`,
  plus a small set of global rules (animations, prefers-reduced-motion, print,
  selection) that don't belong in component classes.
- Every component uses Tailwind utilities, with `@apply` for the few repeated
  patterns that resist utility-only expression (typography, primary button).

## Rough effort estimate

I'd guess **15–20 focused sessions of work** depending on how tight you want
the visual diff to be. The "5–10 sessions" number from the option text was
optimistic — that stylesheet has a lot of bespoke gradients, fluid `clamp()`
values, custom keyframes, and pseudo-class chains that take care to translate
faithfully.

If you want it faster, we can take shortcuts (drop the marquee animation, use
flat colours instead of gradients, simplify some layouts) — but that's a
visual-design conversation, not a migration conversation. Default plan below
preserves the design.

---

## Phase 0 — Setup (1 session)

**Goal:** Tailwind has every token and primitive it needs to express a
component without falling back to arbitrary values.

1. **Promote tokens.** Move every `--auren-*` variable from `.shell` (in
   `store.module.css`) to `:root` in `globals.css`. Verify nothing depends on
   their being scoped (likely nothing does).
2. **Wire tokens into `@theme`.** Inside `@theme` in `globals.css`, alias each
   token so Tailwind generates utilities:
   ```css
   @theme {
     --color-auren-bg: #050505;
     --color-auren-text: #f8f4ec;
     --color-auren-text-soft: rgba(248, 244, 236, 0.76);
     --color-auren-accent: #d6bf8d;
     --color-auren-line: rgba(255, 255, 255, 0.12);
     --color-auren-danger: #e8a29b;
     --radius-auren: 8px;
     --ease-auren: cubic-bezier(0.22, 1, 0.36, 1);
     --spacing-container: clamp(18px, 4vw, 56px);
     --spacing-section: clamp(76px, 9vw, 128px);
   }
   ```
   This generates `bg-auren-bg`, `text-auren-text-soft`, `border-auren-line`,
   `rounded-auren`, `ease-auren`, `px-container`, etc.
3. **Register custom keyframes** (`marquee`, `pageIn`, anything else) in
   `globals.css` and expose as `--animate-marquee` etc. under `@theme`.
4. **Define the few `@apply` component classes** that are used everywhere and
   would be painful as inline utility lists:
   ```css
   @layer components {
     .btn-primary { @apply inline-flex items-center justify-center ... ; }
     .btn-secondary { @apply ... ; }
     .panel { @apply border border-auren-line rounded-auren ... ; }
     .field-input { @apply w-full ... ; }
   }
   ```
   Resist the urge to add more — `@apply` is a slope. If something appears
   in 5+ components, consider an `@apply` class. Otherwise inline.
5. **Add `npm run css:audit` script.** A small Node script that lists rules in
   `store.module.css` that are NOT referenced from any JSX file (grep
   `styles.X` against rule names). After each migration chunk, run it and
   delete the now-dead rules. Without this, the file ships unused CSS forever.

**Exit criteria:** A single component (let's say `SummaryLine`) has been
ported as proof-of-concept (see "Proof of concept" below). Visual diff
matches.

---

## Migration order — leaf-first

Smaller, lower-risk components first. This builds Tailwind muscle on simple
shapes, surfaces translation patterns early, and avoids touching the design's
high-stakes surfaces (cart, navbar) before the patterns are known.

### Tier 1 — UI primitives (1–2 sessions)
6 components, all small, all reused everywhere. Ports here will give us most
of the `@apply` component classes worth defining.
- `src/components/ui/SummaryLine.tsx`
- `src/components/sections/SectionHeading.tsx`
- `src/components/ui/PaymentMethods.tsx`
- `src/components/ui/FormField.tsx`
- `src/components/navigation/BrandLogo.tsx`
- `src/components/layout/AnnouncementBar.tsx`

### Tier 2 — Auth surfaces (2 sessions)
7 components, similar shapes, all behind `/auth/*`. Low-traffic during port,
easy to QA.
- `AuthPromptCard`, `LoginForm`, `RegisterForm`, `ForgotPasswordForm`,
  `ResetPasswordForm`, `CheckEmailPanel`, `AuthGateModal`

### Tier 3 — Cart + checkout (2 sessions)
6 components. We just rewrote most of these — port immediately so they
don't drift from their fresh state.
- `CartDrawer`, `CheckoutDrawer`, `CheckoutRoute`, `OrderTracker`,
  `PaymentStatusPoller`, `ClearCartOnPaid` (no styles), `PayFastRedirect`
  (no styles)

### Tier 4 — Account (3 sessions)
8 components, mostly forms.
- `AccountShell`, `AccountNav`, `AccountProfileForm`,
  `AccountSettingsPanel`, `AddressBook`, `AccountWishlist`,
  `OrderHistoryList`, `AccountWishlist`

### Tier 5 — Product (2 sessions)
5 components, some complex layouts (`ProductGallery`, `QuickViewModal`).
- `ProductCard`, `ProductFilters`, `QuickViewModal`, `ProductControls`,
  `ProductGallery`

### Tier 6 — Navigation + layout shell (2 sessions)
5 components. **High-stakes** — these are visible on every page. Do them after
the patterns are well-known.
- `Navbar`, `MobileMenu`, `Footer`, `Drawer`, `AppShell`

### Tier 7 — Page templates (3 sessions)
The big surfaces.
- `app/page.tsx` (home), `app/shop/shop-client.tsx`,
  `app/product/[slug]/product-page-client.tsx`,
  `app/orders/confirmation/[orderNumber]/page.tsx`,
  `app/contact/contact-client.tsx`

### Tier 8 — Static & loading pages (1 session)
Trivial.
- `app/about/page.tsx`, `app/faqs/page.tsx`, `app/terms/page.tsx`,
  `app/privacy/page.tsx`, `app/delivery/page.tsx`, `app/returns/page.tsx`,
  all `loading.tsx` files.

### Tier 9 — Cleanup (1 session)
- Delete `src/styles/store.module.css` entirely.
- Move surviving global rules (animations, print, prefers-reduced-motion) to
  `globals.css`.
- Audit final bundle size.
- Remove any dead utilities/`@apply` classes that ended up unused.

---

## Per-component migration recipe

Apply this to every component:

1. Open the component, list every `styles.X` reference.
2. For each `X`, find its rule in `store.module.css` and copy the relevant
   declarations into a `// MIGRATING:` comment above the JSX. (Throwaway —
   gives you the source of truth alongside the JSX while you translate.)
3. Replace each `styles.X` with Tailwind utility classes. Use:
   - Theme tokens where defined (`bg-auren-bg`).
   - `@apply` component classes for repeated complex patterns.
   - Arbitrary values for one-off numbers (`w-[clamp(320px,40vw,560px)]`).
4. Visual diff: run `npm run dev`, open the component in browser, compare
   side-by-side with the live production page (or pre-port screenshot).
5. Run `npm run css:audit`. If any of the X rules are now unreferenced
   anywhere, delete them from `store.module.css`.
6. Remove the `// MIGRATING:` comment.
7. `npx tsc --noEmit` and `npx eslint .` clean.

## Proof of concept (this session, after the plan)

Tier 1 has 6 small components. To prove the approach end-to-end, I'll port
**`SummaryLine`** — the smallest CSS surface in the project, used in 3 places
(cart drawer, checkout page, confirmation page). After the port:
- It uses Tailwind utilities only.
- The `.summaryLine`-related rules in `store.module.css` are deleted.
- Visual output is identical.

If the result looks right, the same recipe applies to everything else.

---

## Risks I want flagged before we start

- **The 727-reference scope is real.** Even at a brisk pace this is weeks of
  elapsed time. Halfway-migrated codebases are painful to live in (two styling
  systems in parallel). Consider whether the *reason* for the migration is
  strong enough to commit. Common reasons:
  - Hiring (Tailwind is more common in the market) — strong reason.
  - Bundle size (Tailwind tree-shakes; the current 4k-line module ships in
    full) — measurable but small win.
  - DX preference (utility classes vs. CSS modules) — taste-dependent.
  - "Design system in code" — `@theme` does help here.
  If the answer is just "the audit prompt said so", that's not a strong
  enough reason and we should stop now.
- **The design has personality.** Gradients on `.shell`, marquee animation,
  `backdrop-filter`, fluid `clamp()` spacing, custom `cubic-bezier` easings.
  All translatable, but each takes care. If the team would accept a flatter
  redesign as part of the migration, that cuts effort by ~30%.
- **Storage of "as designed" reference.** Before starting Tier 1, screenshot
  every page on desktop + 375px wide for visual diff comparison. Without
  this, "looks the same" becomes "I think so".
- **`@apply` is a slope.** It's tempting to make every repeated pattern an
  `@apply` class, at which point you've reinvented CSS modules with extra
  steps. Hold the line: only `@apply` for things appearing in 5+ components.

---

## What I will NOT do as part of this migration

- Not adopting Radix UI, headless-ui, or any other component library. The
  custom `<Drawer>` and forms are fine.
- Not introducing Tailwind plugins (typography, forms) unless a specific
  component needs them.
- Not rewriting the auren design system. Same colours, same spacing, same
  gradients — just expressed differently.
- Not adding dark/light mode switching. Site is dark-only by design.
- Not splitting `globals.css` into multiple files unless it crosses ~400
  lines.
