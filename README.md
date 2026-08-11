#  Craft Supplies

Craft Supplies is a separated e-commerce application:

- The repository root is the existing Next.js 16 storefront. Its visual components and URLs are preserved.
- [`backend`](backend/) is the Laravel 13 REST API and Filament 5 admin panel. Laravel owns business data, authentication, carts, pricing, checkout, orders, media, translations, and Stripe.

Prisma, Auth.js, the Next.js Stripe webhook, direct uploads, and the custom Next.js admin have been removed. `/admin` on the frontend redirects to Filament.

## Requirements

- PHP 8.3+, Composer 2
- Node.js 20+ and npm
- MySQL 8+
- GD or Imagick for media conversions

## Backend setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure `DB_CONNECTION` and the matching database variables. For MySQL, for example:

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=craft_supplies
DB_USERNAME=root
DB_PASSWORD=
FILESYSTEM_DISK=public
MEDIA_DISK=public
```

Then initialize and start Laravel:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
php artisan queue:work
```

Laravel uses MySQL as its application database. Create `craft_supplies` with
the `utf8mb4` character set before running migrations. Do not reuse or erase an
existing database without auditing it first:

```sql
CREATE DATABASE craft_supplies
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

For an existing installation that still has Laravel data in
`backend/database/database.sqlite`, migrate the empty MySQL schema first and
then run the guarded importer. It preserves primary keys and relationships and
refuses to write to non-empty target tables unless `--force` is explicitly
provided:

```bash
php artisan migrate
php artisan db:import-sqlite database/database.sqlite
```

The API is at `http://localhost:8000/api/v1`; Filament is at `http://localhost:8000/admin`.

Seeded logins:

- Admin: `admin@craftsupply.test` / `Admin123!`
- Customer: `customer@example.test` / `Customer123!`

Passwords are passed through Laravel's hashed cast and are never stored as plaintext.

## Frontend setup

From the repository root:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required frontend configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Open `http://localhost:3000`. Sanctum tokens and guest cart identifiers are held in secure HTTP-only cookies by Next.js server actions. Browser bundles receive no Laravel, Stripe, database, or mail secrets.

## Translations and RTL

Laravel stores translatable JSON through `spatie/laravel-translatable`; no duplicated `_en`/`_ar` columns exist. The API locale middleware reads `Accept-Language: en` or `ar`, with English fallback. Filament forms expose English and Arabic tabs. The centralized API client forwards the request locale; the existing UI can set document direction to RTL when its locale selector is enabled.

## Media and storage

Spatie Media Library owns catalog/blog/review images and their ordering. Local files use `storage/app/public` via `php artisan storage:link`. Set `FILESYSTEM_DISK=s3` and `MEDIA_DISK=s3` for S3-compatible production storage. Product conversions are `thumb`, `medium`, and queued `large`.

## Stripe and simulated checkout

Local checkout is simulated by default:

```env
CHECKOUT_SIMULATED=true
```

For Stripe test mode:

```env
CHECKOUT_SIMULATED=false
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Register `POST http://localhost:8000/api/v1/webhooks/stripe`. Laravel calculates the amount and validates the signature; webhook event IDs are recorded for idempotency. Stripe secrets exist only in `backend/.env`.

## Mail

Development uses `MAIL_MAILER=log`. Configure SMTP, Postmark, Resend, or another Laravel mail transport through backend environment variables. Password resets point back to the Next.js reset page; contact notifications run after the response. Run a queue worker in production for queued media/email work.

## Verification

```bash
cd backend
vendor/bin/pint --test
php artisan test

cd ..
npm run lint
npx tsc --noEmit
npm run build
```

API details and payloads are documented in [`backend/docs/API.md`](backend/docs/API.md).
