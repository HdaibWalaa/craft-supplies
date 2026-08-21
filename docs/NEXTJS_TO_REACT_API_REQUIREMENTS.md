# Next.js to React API Requirements

The Vite frontend uses `VITE_API_URL` (default `http://localhost:8000/api/v1`). JSON responses use Laravel resource envelopes (`{ "data": ... }`); validation failures use `{ "message", "errors" }`. Authenticated requests send `Authorization: Bearer <token>`, localized requests send `Accept-Language`, and guest-cart requests send `X-Cart-Token`.

| Method | Endpoint | Purpose / auth | Request | Expected response | Replaces / consumers |
|---|---|---|---|---|---|
| POST | `/auth/register` | Register; guest | `{name,email,password,password_confirmation}` | `{data:{token,user}}` | register Server Action; register page/AuthProvider |
| POST | `/auth/login` | Login; guest | `{email,password,device_name?}` | `{data:{token,user}}` | auth Server Action; login form/AuthProvider |
| GET | `/auth/me` | Current user; bearer | none | `{data:User}` | `auth()` cookie helper; header/account/guards |
| POST | `/auth/logout` | Logout; bearer | none | message | logout Server Action; header/AuthProvider |
| POST | `/auth/forgot-password` | Request reset; guest | `{email}` | message | password-reset Server Action; forgot-password page |
| POST | `/auth/reset-password` | Complete reset; guest | `{token,email,password,password_confirmation}` | message | password-reset Server Action; reset page |
| PATCH | `/auth/profile` | Update profile; bearer | profile fields | `{data:User}` | account API-ready infrastructure |
| PUT | `/auth/password` | Change password; bearer | password fields | message | account API-ready infrastructure |
| GET | `/products` | Catalog/search/filter | `q,category,min_price,max_price,in_stock,sort,page,per_page,featured,new_arrival,bundle` | paginated `ApiProduct` collection | server catalog fetching; home/shop/search |
| GET | `/products/:slug` | Product detail | slug | `{data:ApiProduct}` including variants, reviews, related data | dynamic product Server Component |
| POST | `/products/:id/reviews` | Submit review | multipart `author_name,rating,title,comment,images?` | review/message | review Server Action; ReviewForm |
| GET | `/categories` | Category navigation/list | none | `{data:ApiCategory[]}` | layout/home/shop server fetching |
| GET | `/categories/:slug` | Category detail | slug | `{data:ApiCategory}` | dynamic category page |
| GET | `/categories/:slug/products` | Category products | catalog filters/pagination | paginated products | category/catalog integration |
| GET | `/testimonials` | Published testimonial cards | none | `{data:Testimonial[]}` | homepage server fetch |
| GET | `/cart` | Resolve cart; bearer and/or cart token | headers | `{data:ApiCart}` | cookie-bound cart helper; header/cart/checkout |
| POST | `/cart/items` | Add item | `{variant_id,quantity}` plus cart token | `{data:ApiCart}` with generated token | add-to-cart Server Action; purchase controls |
| PATCH | `/cart/items/:item` | Change quantity | `{quantity}` | `{data:ApiCart}` | cart Server Action; CartItemRow |
| DELETE | `/cart/items/:item` | Remove item | cart token | message | cart Server Action; CartItemRow |
| DELETE | `/cart` | Clear cart | cart token | message | cart API capability |
| POST | `/cart/merge` | Merge guest cart after login; bearer | `{cart_token}` | `{data:ApiCart}` | auth Server Action merge; AuthProvider |
| POST | `/discounts/validate` | Validate discount | `{code,cart_token}` | `{data:{valid,code,amount}}` | discount Server Action; DiscountCodeForm |
| GET | `/shipping-methods` | Rates for destination | `governorate` | `{data:ApiShippingMethod[]}` | removed `src/app/api/shipping-methods/route.ts` proxy; CheckoutForm now calls the API service directly |
| GET | `/jordan-governorates` | Checkout/address options | none | `{data:ApiGovernorate[]}` | checkout/address server fetch |
| POST | `/checkout` | Create/reserve order; optional bearer | customer/address/shipping/discount/cart fields | `{data:{order,checkout_url}}` | checkout Server Action; CheckoutForm |
| GET | `/checkout/orders/:number` | Guest success/status | `token` | `{data:ApiOrder}` | checkout success Server Component |
| GET | `/orders` | Account order list; bearer | pagination if supported | paginated orders | account/orders pages |
| GET | `/orders/:number` | Account order detail; bearer | order number | `{data:ApiOrder}` | account order API layer |
| GET | `/addresses` | Saved addresses; bearer | none | `{data:ApiAddress[]}` | addresses Server Component |
| POST | `/addresses` | Add address; bearer | address fields | address resource | address Server Action/Form |
| PATCH | `/addresses/:id` | Update address; bearer | address fields | address resource | address API layer |
| DELETE | `/addresses/:id` | Delete address; bearer | none | message | address Server Action/row |
| PATCH | `/addresses/:id/default` | Set default; bearer | none | address/message | address Server Action/row |
| GET | `/wishlist` | Wishlist; bearer | none | `{data:ApiProduct[]}` | wishlist Server Action/pages/button |
| POST | `/wishlist` | Add wishlist item; bearer | `{product_id}` | message/resource | wishlist Server Action/button |
| DELETE | `/wishlist/:product` | Remove item; bearer | none | message | wishlist Server Action/button |
| GET | `/blog` | Blog listing | pagination if supported | paginated `ApiBlogPost` collection | blog Server Component |
| GET | `/blog/:slug` | Blog detail | slug | `{data:ApiBlogPost}` | dynamic blog Server Component |
| POST | `/newsletter/subscribe` | Subscribe | `{email}` | message | newsletter Server Action/forms |
| POST | `/contact` | Contact message | `{name,email,message}` | message | contact Server Action/Form |

`POST /webhooks/stripe` remains backend-only and is never called by the React application. Admin CRUD remains the Laravel Filament application at `VITE_BACKEND_URL/admin`; `/admin/*` in the storefront redirects there.

## Removed frontend route handlers

| Original handler | Replacement |
|---|---|
| `GET /api/search-index` (`src/app/api/search-index/route.ts`) loaded 48 products and mapped the Fuse.js index. | `SearchBar` and `FuzzySearchFallback` call centralized `fetchProducts({ per_page: 48 })` and perform the identical client-side mapping/Fuse matching. No new backend endpoint is required. |
| `GET /api/shipping-methods?governorate=...` (`src/app/api/shipping-methods/route.ts`) proxied the Laravel shipping method collection. | `CheckoutForm` calls centralized `fetchShippingMethods(governorate)`, which uses `GET /shipping-methods`. |
