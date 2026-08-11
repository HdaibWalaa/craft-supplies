# Craft Supplies REST API

Base URL: `http://localhost:8000/api/v1`

All requests should send `Accept: application/json`. Customer-facing content selects English or Arabic from `Accept-Language: en|ar`; admin clients can append `?translations=1` to catalog detail requests. Authenticated routes use `Authorization: Bearer <sanctum-token>`. Validation errors use Laravel's consistent `{ "message": "...", "errors": { "field": ["..."] } }` format.

## Authentication

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| POST | `/auth/register` | No | Register; `name`, `email`, `password`, `password_confirmation` |
| POST | `/auth/login` | No | Login; returns user and Sanctum token |
| POST | `/auth/logout` | Yes | Revoke the current token |
| GET | `/auth/me` | Yes | Current user |
| POST | `/auth/forgot-password` | No | Send a frontend reset link |
| POST | `/auth/reset-password` | No | Reset with `token`, `email`, confirmed password |
| PATCH | `/auth/profile` | Yes | Update name/email |
| PUT | `/auth/password` | Yes | Change password |

Auth endpoints are limited to five attempts per minute per IP/email.

## Catalog and content

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/products` | Paginated catalog |
| GET | `/products/{slug}` | Product, variants, attributes, media, reviews, related products |
| GET | `/categories` | Active root categories |
| GET | `/categories/{slug}` | Category, children and filter definitions |
| GET | `/categories/{slug}/products` | Category products |
| POST | `/products/{id}/reviews` | Submit moderated review; up to four JPEG/PNG/WebP files |
| GET | `/blog` | Published posts |
| GET | `/blog/{slug}` | Post and related products |
| GET | `/testimonials` | Homepage approved reviews |

Product query parameters: `q`, `category`, `min_price`, `max_price`, `in_stock`, `featured`, `new_arrival`, `bundle`, `page`, `per_page` (max 48), and `sort=newest|price_asc|price_desc|rating|popularity`.

Collections use Laravel pagination:

```json
{ "data": [], "links": {}, "meta": { "current_page": 1, "last_page": 1, "total": 0 } }
```

## Cart, discounts, and checkout

Guest calls send the opaque token returned by the first cart mutation as `X-Cart-Token`. Next.js stores it in an HTTP-only `cart_token` cookie. Authenticated requests may use a Sanctum token; `/cart/merge` consumes the guest cart after login.

| Method | Endpoint | Auth | Purpose |
|---|---|---:|---|
| GET | `/cart` | Optional | Current cart |
| POST | `/cart/items` | Optional | Add `variant_id`, `quantity` |
| PATCH | `/cart/items/{id}` | Optional | Change quantity; zero removes |
| DELETE | `/cart/items/{id}` | Optional | Remove item |
| DELETE | `/cart` | Optional | Clear cart |
| POST | `/cart/merge` | Yes | Merge `guest_token` into customer cart |
| POST | `/discounts/validate` | Optional | Validate code against server-loaded cart |
| POST | `/checkout` | Optional | Validate stock, calculate totals, create order/payment |
| GET | `/checkout/orders/{number}?token=...` | No | Secure post-checkout receipt lookup |
| POST | `/webhooks/stripe` | Stripe | Signed, idempotent Stripe webhook |

Checkout accepts `email`, `shipping_method`, optional `discount_code`, and shipping/billing address objects. Prices, discounts, shipping, tax, stock, payment status, and totals in browser payloads are ignored. Order creation, discount usage, snapshots, and stock reservations occur in one database transaction with row locks.

## Customer APIs

Authenticated endpoints: `GET|POST|PATCH|DELETE /addresses`, `PATCH /addresses/{id}/default`, `GET|POST /wishlist`, `DELETE /wishlist/{product}`, `GET /orders`, and `GET /orders/{orderNumber}`.

Public form endpoints are `POST /newsletter/subscribe` and `POST /contact`; both are rate limited.

## Media

Products expose ordered `images` with `url`, `thumb`, `medium`, and `large`. Collections are `product_images`, `thumbnail`, `category_image`, `featured_image`, `content_images`, and `review_images`. Files use Laravel disks (`public` locally, S3-compatible in production).
