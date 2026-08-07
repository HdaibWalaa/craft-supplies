# Kiln & Wick Craft Supply

A full-stack e-commerce site for a handmade/home-based crafts supply business
(candle-making, resin, soap-making, molds, fragrances & pigments, concrete,
and wooden products), plus a built-in admin dashboard for managing the store.

Built with Next.js (App Router, TypeScript), Tailwind CSS, Prisma + SQLite,
Auth.js, and Stripe.

## Quick Start

```bash
npm install
npx prisma migrate dev   # creates the local SQLite database
npm run db:seed          # loads 8 categories, 25 sample products, blog posts, discount codes
npm run dev
```

Open http://localhost:3000.

**Demo accounts** (from the seed script):
- Customer: `customer@example.test` / `Customer123!`
- Admin: `admin@craftsupply.test` / `Admin123!` — sign in at `/admin/login`

## What's Real vs. Stubbed

This was built without live third-party accounts (Stripe, Cloudinary, Algolia,
an email provider, a hosted Postgres). Everything is fully functional against
local/simulated equivalents, with a clear swap-in point for the real service
later. See the table below — nothing here needs a code rewrite, just config.

| Feature | Current implementation | To go live |
|---|---|---|
| Database | SQLite (`prisma/dev.db`) | Set `DATABASE_URL` to a Postgres connection string and change `provider = "sqlite"` to `"postgresql"` in `prisma/schema.prisma`, then `npx prisma migrate deploy` |
| Payments | Stripe Checkout in test mode **if keys are set**, otherwise an instant "simulated" payment so checkout is fully testable today | Add `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env`, and register `/api/webhooks/stripe` in the Stripe dashboard with `STRIPE_WEBHOOK_SECRET` |
| Product photography | Generated gradient placeholder tiles per category | Upload real photos via the admin product editor (drag-and-drop → saved to `/public/uploads`) — product images are business-owner-supplied content, not something to invent |
| Search | Server-side substring match, with client-side Fuse.js typo-tolerant fallback when there are no exact matches | Swap `lib/data.ts#getShopProducts` search + `SearchBar.tsx` for an Algolia/Meilisearch client if the catalog grows large |
| Email (order confirmations, password resets, contact form) | Logged to the server console (`lib/email.ts`) | Add a real provider call (Resend/Postmark/SendGrid) inside `sendEmail()` — every call site stays the same |
| Newsletter signups | Stored in the local `NewsletterSubscriber` table | Wire `app/actions/newsletter.ts` to Mailchimp/Klaviyo's API |
| Shipping rates | Flat-rate Standard/Express, configured in `lib/pricing.ts` | Replace with a carrier-rate API call in the checkout action if real-time rates are needed |
| Instagram feed | Not built (needs an Instagram Graph API token from the business owner) | — |
| Hosting | Not deployed — see Deploying below | — |

## Managing the Store (Admin Dashboard)

Go to `/admin/login` and sign in with an admin account (see demo credentials
above, or promote a user by setting `role = "ADMIN"` on their `User` row).

- **Products** (`/admin/products`) — add/edit/delete products, variants
  (size/scent/color with independent price & stock), attributes, safety
  warnings, and images (upload or leave blank for an auto-generated
  placeholder tile).
- **Categories** (`/admin/categories`) — add/edit/delete the shop's
  categories.
- **Orders** (`/admin/orders`) — view orders, filter by status, open an
  order to update its status (customer gets an email/console notification)
  or review its items and shipping address.
- **Discount Codes** (`/admin/discounts`) — create percent/fixed codes with
  a minimum spend and optional usage limit, activate/deactivate, delete.
- **Blog** (`/admin/blog`) — write tutorial posts and tag which products
  they cross-sell.
- **Overview** (`/admin`) — revenue chart, order count, low-stock alerts.

Low stock is flagged per-variant using each variant's "low stock at"
threshold (default 5), editable in the product editor.

## Project Structure

```
prisma/schema.prisma        Data model (see below)
prisma/seed.ts               Sample data loader
src/app/(storefront)/        Public site: shop, product, cart, checkout, account, blog...
src/app/admin/               Admin dashboard (route-protected)
src/app/actions/             Server Actions (cart, checkout, auth, reviews, admin CRUD...)
src/app/api/                 Route handlers (search index, uploads, NextAuth, Stripe webhook)
src/components/              UI components (storefront + admin + shared ui/ primitives)
src/lib/                     Server-side helpers (prisma client, cart, pricing, discount, email, stripe)
```

### Data model

`User`, `Address`, `Category`, `Product`, `ProductVariant`, `Review`, `Cart` /
`CartItem` (guest-cookie based, merges into the account cart on login),
`Order` / `OrderItem`, `DiscountCode`, `BlogPost`, `NewsletterSubscriber`,
`Wishlist`. Product `images`/`attributes`/`specifications` are stored as JSON
strings (SQLite has no native JSON column) — see `lib/data.ts`'s
`parseImages`/`parseJsonObject` helpers.

## Environment Variables

Copy `.env.example` to `.env` (already done for local dev) and fill in real
values as they become available:

- `DATABASE_URL` — SQLite file path locally; a Postgres URL in production
- `AUTH_SECRET` — replace the placeholder with `npx auth secret` before deploying
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` — optional, enables real Stripe Checkout
- `NEXT_PUBLIC_GA_ID` — optional, enables Google Analytics
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — the store's WhatsApp contact number (digits only, with country code)
- `NEXT_PUBLIC_SITE_URL` — the canonical site URL, used in metadata, the sitemap, and Stripe redirect URLs

## Known Limitations / Fast Follows

- Category pages filter by price/stock/sort but not yet by the
  category-specific attributes (scent family, wood type, etc.) shown on
  product pages — the data is there (`Product.attributes`), the filter UI
  for it isn't wired up yet.
- Review photo attachments take a URL rather than a direct file upload
  (product images do support real upload, via `/api/admin/upload`).
- `middleware.ts` uses Auth.js's documented `auth()`-wrapped middleware
  pattern; Next.js has since introduced a `proxy.ts` convention that
  deprecates this (build-time warning only, not an error).

## Deploying

This app hasn't been deployed anywhere — no hosting/Stripe/database
accounts were available in the environment it was built in. To take it live:

1. Provision a Postgres database (e.g. Neon, Supabase, Railway) and update
   `DATABASE_URL` + the Prisma provider (see table above).
2. Run `npx prisma migrate deploy` against it, then `npm run db:seed` if you
   want the sample catalog (or skip it and add real products via the admin).
3. Deploy the Next.js app to Vercel (`vercel deploy`) or any Node host —
   set all the environment variables above in the platform's dashboard.
4. Add real Stripe keys and register the webhook endpoint (see table above)
   once you're ready to accept real payments.
# craft-supplies
