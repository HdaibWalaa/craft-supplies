<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShippingMethodResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->method->id, 'name' => $this->method->name, 'description' => $this->method->description,
            'price' => (float) $this->price, 'estimated_days_min' => $this->estimated_days_min,
            'estimated_days_max' => $this->estimated_days_max, 'is_default' => $this->is_default,
            'zone' => ['id' => $this->zone->id, 'name' => $this->zone->name, 'slug' => $this->zone->slug]];
    }
}
