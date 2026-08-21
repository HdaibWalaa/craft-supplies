# Next.js to React Migration

## Architecture

The original application combined Next.js 16 App Router Server Components, Server Actions, route handlers, cookie helpers, metadata routes, and proxy middleware with a Laravel API in `backend/`. The migrated storefront is React 19 + TypeScript + Vite + React Router + Tailwind CSS 4. Laravel remains the sole backend and business-rule owner.

## Audit findings

Next-specific code included App Router pages/layouts, dynamic `[slug]`/`[token]` segments, `next/link`, `next/image`, navigation hooks, `notFound`/`redirect`, `next/headers` cookies, cache revalidation, Server Actions, metadata generation, two route handlers, sitemap/robots generation, and proxy-based account/admin redirects. No Auth.js/`next-auth` or Prisma dependency was installed in the frontend; authentication already targeted Laravel Sanctum tokens.

### Cause of the `next/package.json` error

The npm scripts already named Vite, but the first migration left three independent Next.js project-detection signals in place: `next.config.ts`, the complete App Router-shaped `src/app` directory, and the generated Next agent marker in `AGENTS.md`. It also retained `next/*` aliases in Vite/TypeScript and routed pages through an App Router glob. A surrounding runner could therefore classify the repository as Next.js before the npm `vite` command was used, then fail because the correctly removed `next` dependency no longer provided `next/package.json`.

The repair removed `next.config.ts`, the obsolete marker, `.next`, stale `node_modules/@next` artifacts, every Next alias/import/directive, and the `src/app` directory after moving its UI and mutation modules intact to `src/pages`, `src/actions`, and `src/styles`.

## Migration approach

- Vite owns development and production builds; `src/main.tsx` mounts the SPA.
- React Router explicitly preserves every public storefront URL and provides the wildcard 404.
- Existing page JSX and shared components remain the visual source of truth. Explicit React Router records render the modules in `src/pages`; `AsyncRoute` provides cached Suspense API loading and preserves the existing loading/error views.
- Browser-safe API state replaced HTTP-only Next cookies: auth token, guest-cart token, discount code, and locale use a single storage utility. The API client adds locale, bearer, and cart headers.
- `AuthProvider` exposes current user/login/register/logout and merges a guest cart after login. `ProtectedRoute` replaces middleware for account and checkout pages and retains callback URLs.
- Every former Server Action was moved to `src/actions`, converted to a browser API mutation, and dispatches a shared refresh event where data must reload, preserving React 19 form pending/error behavior.
- Standard responsive images preserve existing wrapper sizing, object-fit, lazy/eager loading, alt text, and placeholders.
- Existing Tailwind CSS 4 tokens and global stylesheet are reused unchanged.

## Routes migrated

`/`, `/shop`, `/product/:slug`, `/category/:slug`, `/search`, `/cart`, `/checkout`, `/checkout/success`, `/account`, `/account/login`, `/account/register`, `/account/forgot-password`, `/account/reset-password/:token`, `/account/addresses`, `/account/orders`, `/account/wishlist`, `/blog`, `/blog/:slug`, `/about`, `/contact`, `/faq`, `/shipping-returns`, `/privacy`, `/terms`, and `*` (404). `/admin/*` redirects to the existing Laravel admin.

## Feature migration

The existing header/footer, navigation, language switching, catalog grids/lists/filters/sorting/pagination, category/product/blog detail layouts, Fuse.js fallback, cart controls, guest cart persistence, login merge, discounts, checkout, addresses, orders, wishlist, reviews, newsletter, contact, mobile navigation, and RTL/LTR styles are reused. Backend pricing, discounts, inventory, shipping, order, review, and wishlist rules were not moved or changed.

## Configuration and packages

Environment names changed from `NEXT_PUBLIC_*` to `VITE_*`; see `.env.example`. Added Vite, its React plugin, React Router, and React ESLint plugins. Removed `next`, `eslint-config-next`, all `@next/*` packages, and the unused Axios dependency. The centralized fetch client remains in `src/lib/api/client.ts`; retaining it avoids an unnecessary transport rewrite while meeting the single-client requirement.

Obsolete Next layouts, proxy, sitemap, robots, configuration, generated marker, route handlers, and App Router directories were removed after their replacements were connected. The original page/component JSX now lives under `src/pages` and is imported by explicit React Router routes.

## SEO and deployment

React 19 document metadata components preserve route titles/descriptions and dynamic product/category/blog metadata; product JSON-LD is preserved. Unlike SSR, crawler-specific social previews require the hosting layer to prerender routes or the future Laravel backend to emit social metadata.

`public/_redirects` provides the common SPA fallback (`/* /index.html 200`) for Netlify-compatible hosts. Apache/Nginx/Vercel deployments must equivalently rewrite every non-file storefront request to `/index.html`; without this, refreshing a nested route cannot work.

## Verification

- `npm install`: completed; `npm ls next next-auth --all` is empty and no `node_modules/next`, `node_modules/@next`, `.next`, `next.config.*`, or `src/app` remains.
- `npm run dev`: starts `VITE v7.3.6` at the configured Vite port; no Next.js or Turbopack process starts.
- Direct HTTP navigation returned the Vite entry document for `/`, `/shop`, product/category URLs, cart, checkout, account, blog, contact, and an unknown URL.
- Headless Chrome with the local Laravel API rendered homepage, shop, real category/product pages, search, cart, login, register, protected checkout behavior, blog list/detail, contact, and 404 with no detected React/runtime/fetch error.
- `npm run build`: completed successfully with TypeScript and Vite (1,988 modules).
- `npm run typecheck`: completed successfully.
- `npm run lint`: completed successfully with no errors or warnings.

## Remaining limitations

- Authenticated mutation flows still require valid customer test credentials and transactional checkout test data for full destructive end-to-end submission testing; route rendering and guest/protected behavior were browser-verified against the running API.
- SPA metadata cannot provide SSR social previews by itself; use host prerendering or Laravel-rendered metadata where that is a production requirement.
- Tokens now live in browser storage because a static React SPA cannot set/read secure HTTP-only cookies. For production, the preferred Laravel deployment is same-origin Sanctum cookie authentication with CSRF protection; the provider/API client boundary is ready to be adjusted without changing page UI.

Detailed backend contracts are in `docs/NEXTJS_TO_REACT_API_REQUIREMENTS.md`.
