<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => (string) $this->id, 'orderNumber' => $this->order_number, 'accessToken' => $this->access_token, 'email' => $this->email,
            'status' => $this->status->value, 'paymentStatus' => $this->payment_status->value, 'paymentMethod' => $this->payment_method,
            'shippingMethod' => $this->shipping_method, 'shippingAddress' => $this->shipping_address, 'billingAddress' => $this->billing_address,
            'subtotal' => (float) $this->subtotal, 'discountTotal' => (float) $this->discount_total, 'shippingTotal' => (float) $this->shipping_total,
            'taxTotal' => (float) $this->tax_total, 'total' => (float) $this->total, 'currency' => $this->currency,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => ['id' => (string) $item->id, 'productName' => $item->product_name,
                'variantName' => $item->variant_name, 'sku' => $item->sku, 'unitPrice' => (float) $item->unit_price, 'quantity' => $item->quantity, 'subtotal' => (float) $item->subtotal])),
            'createdAt' => $this->created_at?->toISOString()];
    }
}
