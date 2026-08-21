<?php

namespace App\Services\WhatsApp;

use App\Enums\JordanGovernorate;
use App\Filament\Resources\Orders\OrderResource;
use App\Models\Order;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class MetaWhatsAppService
{
    public function enabled(): bool
    {
        return (bool) config('whatsapp.enabled');
    }

    public function sendNewOrderNotification(Order $order): ?string
    {
        if (! $this->enabled()) {
            return null;
        }

        $order->loadMissing(['items', 'user']);
        $this->validateConfiguration();

        $response = $this->client()->post($this->endpoint(), match (config('whatsapp.message_mode')) {
            'template' => $this->templatePayload($order),
            'text' => $this->textPayload($order),
            default => throw new RuntimeException('WHATSAPP_MESSAGE_MODE must be template or text.'),
        });

        $response->throw();

        return $response->json('messages.0.id');
    }

    /** @return array<string, mixed> */
    public function templatePayload(Order $order): array
    {
        $parameters = collect($this->templateParameters($order))
            ->map(fn (string $value) => ['type' => 'text', 'text' => $value])
            ->all();

        return [
            'messaging_product' => 'whatsapp',
            'to' => $this->recipient(),
            'type' => 'template',
            'template' => [
                'name' => config('whatsapp.order_template'),
                'language' => ['code' => config('whatsapp.template_language')],
                'components' => [['type' => 'body', 'parameters' => $parameters]],
            ],
        ];
    }

    /** @return array<string, mixed> */
    public function textPayload(Order $order): array
    {
        return [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $this->recipient(),
            'type' => 'text',
            'text' => ['preview_url' => false, 'body' => $this->textMessage($order)],
        ];
    }

    /** @return array<int, string> */
    public function templateParameters(Order $order): array
    {
        $address = $order->shipping_address ?? [];

        return [
            $order->order_number,
            $this->customerName($order),
            (string) ($address['phone'] ?? '—'),
            $this->itemsSummary($order),
            $this->money($order->total, $order->currency),
            $this->paymentStatus($order),
            $this->addressSummary($address),
            OrderResource::getUrl('edit', ['record' => $order]),
        ];
    }

    public function textMessage(Order $order): string
    {
        [$number, $customer, $phone, $items, $total, $paymentStatus, $address, $url] = $this->templateParameters($order);

        return implode("\n", [
            'طلب جديد 🛍️',
            '',
            'رقم الطلب: #'.$number,
            'العميل: '.$customer,
            'الهاتف: '.$phone,
            'المحافظة: '.(isset($order->shipping_address['governorate']) ? (JordanGovernorate::tryFrom($order->shipping_address['governorate'])?->label('ar') ?? $order->shipping_address['governorate']) : '—'),
            'البريد: '.$order->email,
            '',
            'المنتجات:',
            $items,
            '',
            'المجموع الفرعي: '.$this->money($order->subtotal, $order->currency),
            'الخصم: '.$this->money($order->discount_total, $order->currency),
            'تكلفة التوصيل: '.$this->money($order->shipping_total, $order->currency),
            'طريقة التوصيل: '.($order->shipping_method_name ?? $order->shipping_method),
            'الضريبة: '.$this->money($order->tax_total, $order->currency),
            'الإجمالي: '.$total,
            '',
            'طريقة الدفع: '.$order->payment_method,
            'حالة الطلب: '.$this->orderStatus($order),
            'حالة الدفع: '.$paymentStatus,
            '',
            'العنوان: '.$address,
            '',
            'رابط الطلب:',
            $url,
        ]);
    }

    private function client(): PendingRequest
    {
        return Http::withToken((string) config('whatsapp.access_token'))
            ->acceptJson()
            ->asJson()
            ->timeout((int) config('whatsapp.timeout', 10));
    }

    private function endpoint(): string
    {
        return sprintf(
            'https://graph.facebook.com/%s/%s/messages',
            config('whatsapp.api_version'),
            config('whatsapp.phone_number_id'),
        );
    }

    private function validateConfiguration(): void
    {
        foreach (['api_version', 'phone_number_id', 'access_token', 'admin_number', 'order_template', 'template_language'] as $key) {
            if (blank(config('whatsapp.'.$key))) {
                throw new RuntimeException('Missing WhatsApp configuration: '.$key.'.');
            }
        }

        $this->recipient();
    }

    private function recipient(): string
    {
        $recipient = preg_replace('/[\s()+-]/', '', (string) config('whatsapp.admin_number'));
        if (! is_string($recipient) || preg_match('/^[1-9]\d{6,14}$/', $recipient) !== 1) {
            throw new RuntimeException('WHATSAPP_ADMIN_NUMBER must use an international E.164-style number without a guessed country code.');
        }

        return $recipient;
    }

    private function customerName(Order $order): string
    {
        $address = $order->shipping_address ?? [];
        $name = trim((string) ($address['full_name'] ?? implode(' ', array_filter([$address['first_name'] ?? null, $address['last_name'] ?? null]))));

        return $name !== '' ? $name : ($order->user?->name ?? $order->email);
    }

    private function itemsSummary(Order $order): string
    {
        $limit = max(1, (int) config('whatsapp.order_item_limit', 8));
        $lines = $order->items->take($limit)->map(function ($item): string {
            $variant = trim((string) $item->variant_name);
            $name = $item->product_name.($variant !== '' && ! in_array(Str::lower($variant), ['default', 'افتراضي'], true) ? ' - '.$variant : '');

            return '• '.$name.' × '.$item->quantity;
        });
        $remaining = $order->items->count() - $limit;
        if ($remaining > 0) {
            $lines->push('+ '.$remaining.' منتجات أخرى');
        }

        return $lines->implode("\n");
    }

    /** @param array<string, mixed> $address */
    private function addressSummary(array $address): string
    {
        $parts = array_filter([
            isset($address['governorate']) ? (JordanGovernorate::tryFrom($address['governorate'])?->label('ar') ?? $address['governorate']) : null,
            $address['address'] ?? null,
            $address['line_1'] ?? null,
            $address['line_2'] ?? null,
            $address['city'] ?? null,
            $address['region'] ?? null,
            $address['postal_code'] ?? null,
            $address['country_code'] ?? null,
        ]);

        return $parts ? implode('، ', $parts) : '—';
    }

    private function paymentStatus(Order $order): string
    {
        return match ($order->payment_status->value) {
            'paid' => 'مدفوع',
            'failed' => 'فشل الدفع',
            'refunded' => 'مسترد',
            default => 'بانتظار الدفع',
        };
    }

    private function orderStatus(Order $order): string
    {
        return match ($order->status->value) {
            'processing' => 'قيد التجهيز', 'paid' => 'مدفوع', 'shipped' => 'تم الشحن', 'delivered' => 'تم التوصيل',
            'cancelled' => 'ملغي', 'refunded' => 'مسترد', default => 'قيد الانتظار',
        };
    }

    private function money(string|float|int $amount, string $currency): string
    {
        return number_format((float) $amount, 2).' '.(strtoupper($currency) === 'JOD' ? 'د.أ' : strtoupper($currency));
    }
}
