<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'salePrice' => $this->sale_price === null ? null : (float) $this->sale_price,
            'stock' => $this->stock,
            'lowStockAt' => $this->low_stock_threshold,
            'isActive' => $this->is_active,
            'attributes' => '{}',
        ];
    }
}
