<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestimonialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $product = $this->whenLoaded('product');

        return [
            'id' => (string) $this->id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'authorName' => $this->author_name,
            'product' => $product && ! $product instanceof \Illuminate\Http\Resources\MissingValue
                ? ['name' => $product->name, 'slug' => $product->slug]
                : null,
        ];
    }
}
