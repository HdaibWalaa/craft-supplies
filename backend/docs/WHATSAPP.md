# WhatsApp order notifications

The backend sends one queued store-owner notification through the official Meta WhatsApp Business Cloud API after checkout successfully creates an order. The browser and Next.js never receive WhatsApp credentials.

## Meta setup

1. Create or select a Meta Business portfolio and WhatsApp Business Account in Meta Business Manager.
2. Add a WhatsApp phone number in WhatsApp Manager.
3. Copy its **Phone Number ID** (not the displayed telephone number).
4. Create a system user/access token with the WhatsApp messaging permission. Use a permanent production token and rotate it according to your security policy.
5. Add the store owner's WhatsApp number as the configured recipient. Use an international E.164-style number; `9627...` and `+9627...` are accepted, but the application never guesses a missing country code.

Never commit the access token or expose it using a `NEXT_PUBLIC_*` variable.

## Environment

```env
WHATSAPP_ENABLED=false
WHATSAPP_API_VERSION=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_ADMIN_NUMBER=
WHATSAPP_MESSAGE_MODE=template
WHATSAPP_ORDER_TEMPLATE=admin_new_order_ar
WHATSAPP_ORDER_TEMPLATE_LANGUAGE=ar
WHATSAPP_ORDER_ITEM_LIMIT=8
WHATSAPP_TIMEOUT=10
```

Keep `WHATSAPP_ENABLED=false` until the Meta number, token, recipient, and approved template are ready. Clear cached configuration after changes:

```bash
php artisan optimize:clear
```

Set `WHATSAPP_API_VERSION` to the currently supported Graph API version shown in Meta's WhatsApp Cloud API documentation (for example, `vXX.X`). It is intentionally not fixed in application code so it can be upgraded through configuration.

## Required Meta template

Create and submit a utility/transactional template in WhatsApp Manager. Approval is performed by Meta and cannot be automated by this project.

- Suggested name: `admin_new_order_ar`
- Language: Arabic (`ar`)
- Category: Utility (subject to Meta's current classification rules)

Suggested body:

```text
طلب جديد 🛍️

رقم الطلب: {{1}}
العميل: {{2}}
الهاتف: {{3}}
المنتجات:
{{4}}
الإجمالي: {{5}}
حالة الدفع: {{6}}
العنوان: {{7}}

عرض الطلب:
{{8}}
```

Parameters are sent in exactly this order:

1. Order number
2. Customer name from the shipping snapshot, account name, or order email
3. Shipping phone, or `—`
4. Order-item snapshot summary, limited by `WHATSAPP_ORDER_ITEM_LIMIT`
5. Authoritative order total and stored currency
6. Arabic payment status
7. Shipping-address snapshot
8. Generated Filament order edit URL

If the approved template text or variable count differs, update both the Meta template and `MetaWhatsAppService::templateParameters()` together.

## Text mode

`WHATSAPP_MESSAGE_MODE=text` sends a detailed free-form Arabic message. It is intended only for development or a valid open customer-service conversation window. Business-initiated production messages generally require an approved template; template mode is the default.

## Database and queue

Run migrations and a queue worker:

```bash
php artisan migrate
php artisan queue:work --tries=3
```

The project already contains Laravel's `jobs`, `job_batches`, and `failed_jobs` migrations. Production should use `database`, Redis, or another durable queue—not `sync`. The listener retries three times with bounded backoff.

Successful sends set `orders.admin_whatsapp_notified_at` and save Meta's provider message ID. An order-scoped cache lock plus that timestamp prevents duplicate events, jobs, and Stripe webhook processing from sending the same notification again.

## Test an existing order

```bash
php artisan whatsapp:test-order 123
```

When enabled, the command warns and asks for confirmation because it may send a real message. When disabled, no HTTP request is made. Already-notified orders are skipped by duplicate protection.

## Troubleshooting

- **401/403:** verify token validity, system-user permissions, and Phone Number ID.
- **Template not found/language mismatch:** confirm the approved template name and exact language code.
- **Recipient rejected:** verify the international number and Meta test-recipient restrictions.
- **Jobs remain queued:** run `php artisan queue:work` and inspect `failed_jobs`/Laravel logs.
- **No request locally:** confirm `WHATSAPP_ENABLED=true`, then run `php artisan optimize:clear`.
- **Duplicate event:** the successful notification timestamp should make subsequent jobs exit without an API call.

Logs include order IDs, response failures, and provider message IDs where available. Access tokens are never logged.

To disable the integration safely, set `WHATSAPP_ENABLED=false` and clear the configuration cache.
