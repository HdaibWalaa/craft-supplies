<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->items->map(fn ($item) => [
            'id' => (string) $item->id,
            'quantity' => $item->quantity,
            'unitPrice' => (float) ($item->variant->sale_price ?? $item->variant->price),
            'lineTotal' => round((float) ($item->variant->sale_price ?? $item->variant->price) * $item->quantity, 2),
            'variant' => ProductVariantResource::make($item->variant),
            'product' => ProductResource::make($item->variant->product),
        ]);

        return [
            'id' => (string) $this->id,
            'token' => $this->token,
            'items' => $items,
            'itemCount' => $items->sum('quantity'),
            'subtotal' => round($items->sum('lineTotal'), 2),
        ];
    }
}
