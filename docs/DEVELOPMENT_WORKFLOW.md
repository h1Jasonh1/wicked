# Development Workflow

Use `develop` for ongoing work and feature branches for individual changes.

Recommended flow:
1. Branch from `develop`.
2. Make the smallest coherent change.
3. Run `npm run lint`.
4. Run `npm run build`.
5. Test the relevant desktop and mobile flows locally.
6. Push the branch and use a Vercel preview deployment for review.
7. Merge into `main` only after approval.

Suggested commit style:
- `feat: add product filter shortcut`
- `fix: eager load header logo`
- `refactor: split storefront shell components`
- `docs: add onboarding workflow`
- `chore: update dependencies`

Core flows to check before merging:
- Home page
- Shop search and filters
- Product page
- Wishlist drawer
- Cart drawer
- Checkout preview
- Header search
- Mobile menu
- Delivery, returns, contact, FAQ, privacy, and terms pages
