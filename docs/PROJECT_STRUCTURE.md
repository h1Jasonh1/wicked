# Project Structure

`src/app` contains public App Router routes. Shared implementation code lives outside `app` so route files stay small and predictable.

Main folders:
- `src/components/layout`: app shell, announcement bar, footer.
- `src/components/navigation`: navbar, mobile menu, logo.
- `src/components/search`: expanding header search.
- `src/components/product`: product cards, visuals, gallery, filters, controls, quick view.
- `src/components/cart`: cart drawer and checkout drawer.
- `src/components/wishlist`: wishlist drawer.
- `src/components/ui`: shared drawer, icons, form field, payment badges, summary line.
- `src/components/sections`: reusable page sections such as product rails and section headings.
- `src/data`: catalogue, category, navigation, and brand-facing data.
- `src/store`: shared storefront state provider.
- `src/hooks`: store selectors and small UI behavior hooks.
- `src/lib`: pure helpers for formatting, search, routing, and shop logic.
- `src/styles`: WICKED CSS module and design tokens.
- `src/types`: shared TypeScript types.

Important state:
- Cart, wishlist, drawer, quick-view, search-open, toast, and recently-viewed state are centralized in `src/store/StoreProvider.tsx`.
- Components should use focused hooks from `src/hooks` where possible.

Styling:
- The premium black WICKED theme is centralized in `src/styles/store.module.css`.
- Prefer existing CSS module classes before adding new one-off styles.
