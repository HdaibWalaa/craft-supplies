<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'colorTheme' => $this->color_theme,
            'sortOrder' => $this->sort_order,
            'productCount' => $this->whenCounted('products'),
            '_count' => $this->whenCounted('products', fn () => ['products' => $this->products_count]),
            'image' => $this->whenLoaded('media', fn () => MediaResource::make($this->getFirstMedia('category_image'))),
            'metaTitle' => $this->meta_title,
            'metaDescription' => $this->meta_description,
            'filters' => $this->whenLoaded('attributes', fn () => $this->attributes->where('is_filterable', true)->map(fn ($attribute) => [
                'id' => (string) $attribute->id, 'name' => $attribute->name, 'slug' => $attribute->slug, 'type' => $attribute->type,
                'values' => $attribute->values->map(fn ($value) => ['id' => (string) $value->id, 'value' => $value->value, 'slug' => $value->slug])->values(),
            ])->values()),
            'translations' => $this->when($request->boolean('translations'), fn () => [
                'name' => $this->getTranslations('name'),
                'description' => $this->getTranslations('description'),
                'meta_title' => $this->getTranslations('meta_title'),
                'meta_description' => $this->getTranslations('meta_description'),
            ]),
        ];
    }
}
