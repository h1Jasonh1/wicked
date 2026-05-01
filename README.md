# WICKED

Premium black-theme skincare e-commerce website built with Next.js App Router, React, TypeScript, Tailwind CSS v4 globals, CSS Modules, and `next/image`.

## What This Project Is

WICKED is a storefront prototype for a premium skincare brand. It includes home, shop, product detail, search, filtering, wishlist, cart, checkout preview, contact, delivery, returns, FAQ, privacy, and terms pages.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- CSS Modules for the WICKED design system
- Tailwind CSS v4 global setup
- `next/image` for optimized imagery

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

No environment variables are required for the current static storefront prototype. Add future local variables to `.env.local` and document them here before use.

## Scripts

```bash
npm run dev    # Start local development
npm run lint   # Run ESLint
npm run build  # Production build and type check
npm run start  # Serve a production build
```

## Deployment

Use Vercel preview deployments for branch testing. Push a feature branch, review the preview URL, run through the checkout/search/cart flows, then merge only after approval.

## Branch Workflow

- Use `develop` for ongoing integration work.
- Create feature branches from `develop`.
- Open preview deployments for testing.
- Merge into `main` only when approved and `npm run build` passes.

## Folder Overview

- `src/app`: App Router routes only.
- `src/components`: Shared UI, layout, navigation, product, cart, wishlist, and search components.
- `src/data`: Brand, navigation, category, collection, and product catalogue exports.
- `src/store`: Shared cart, wishlist, drawer, search, toast, and recently viewed state.
- `src/hooks`: Focused hooks for cart, wishlist, search, overlays, and scrolling.
- `src/lib`: Formatting, routing, search, and shop filtering/sorting helpers.
- `src/styles`: Shared WICKED CSS module.
- `src/types`: Product and cart TypeScript types.
- `docs`: Onboarding and workflow notes.

## Where Key Logic Lives

- Product data: `src/data/store.ts`, with product-specific exports in `src/data/products.ts`.
- Categories and searchable category metadata: `src/data/categories.ts`.
- Cart/wishlist/search/drawer/toast state: `src/store/StoreProvider.tsx`.
- Cart hook: `src/hooks/useCart.ts`.
- Wishlist hook: `src/hooks/useWishlist.ts`.
- Header search hook: `src/hooks/useSearch.ts`.
- Shop filtering and sorting: `src/lib/shop.ts`.

## Common Updates

To add a product:
1. Add the product object to `products` in `src/data/store.ts`.
2. Use a stable `id` and URL-safe `slug`.
3. Reuse an existing category or add a new category intentionally.
4. Add gallery scene keys and product visual metadata.
5. Run `npm run lint` and `npm run build`.

To add a category:
1. Add products using the new category name.
2. Add aliases and display label in `src/data/categories.ts` if needed.
3. Add a quick category card if it should appear in the shop shortcut grid.

To update navigation:
Edit `src/data/navigation.ts`.

To update logo assets:
Replace files in `public/assets`. The white logo path is `/assets/wicked-logo-white.png`; the main navbar logo intentionally uses eager loading for LCP.

## Troubleshooting

- If PowerShell blocks `npm`, use `npm.cmd`.
- If `next build` fails with `spawn EPERM` inside a sandbox, rerun it with permission to spawn worker processes.
- If images warn about LCP, check above-the-fold `next/image` usage and avoid eager loading footer images.
- If a route does not render, confirm it has an App Router `page.tsx`.
