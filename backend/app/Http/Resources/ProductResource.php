<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $media = $this->whenLoaded('media', fn () => MediaResource::collection($this->getMedia('product_images')));
        $attributes = $this->whenLoaded('attributeValues', fn () => $this->attributeValues->map(fn ($value) => [
            'id' => $value->id,
            'name' => $value->attribute->name,
            'slug' => $value->attribute->slug,
            'value' => $value->option?->value ?? $value->value,
        ])->values());

        return [
            'id' => (string) $this->id,
            'categoryId' => (string) $this->category_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'shortDescription' => $this->short_description,
            'description' => $this->description,
            'basePrice' => (float) $this->base_price,
            'salePrice' => $this->sale_price === null ? null : (float) $this->sale_price,
            'compareAtPrice' => $this->compare_at_price === null ? null : (float) $this->compare_at_price,
            'status' => $this->status->value,
            'isFeatured' => $this->is_featured,
            'isNewArrival' => $this->is_new_arrival,
            'isBundle' => $this->is_bundle,
            'rating' => (float) $this->rating,
            'reviewCount' => $this->review_count,
            'inStock' => $this->whenLoaded('variants', fn () => $this->variants->contains(fn ($variant) => $variant->is_active && $variant->stock > 0)),
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
            'images' => $media,
            'attributes' => $attributes,
            'specifications' => $this->specifications ?? [],
            'safetyWarnings' => $this->safety_warnings,
            'usageNotes' => $this->usage_notes,
            'metaTitle' => $this->meta_title,
            'metaDescription' => $this->meta_description,
            'updatedAt' => $this->updated_at?->toISOString(),
            'relatedProducts' => ProductResource::collection($this->whenLoaded('relatedProducts')),
            'bundleItemIds' => $this->whenLoaded('relatedProducts', fn () => json_encode($this->relatedProducts->pluck('id')->map(fn ($id) => (string) $id)->all(), JSON_THROW_ON_ERROR)),
            'reviews' => $this->whenLoaded('reviews', fn () => $this->reviews->map(fn ($review) => [
                'id' => $review->id,
                'rating' => $review->rating,
                'title' => $review->title,
                'comment' => $review->comment,
                'authorName' => $review->author_name,
                'createdAt' => $review->created_at?->toISOString(),
                'images' => MediaResource::collection($review->getMedia('review_images')),
            ])),
            'translations' => $this->when($request->boolean('translations'), fn () => collect($this->translatable)->mapWithKeys(fn ($field) => [$field => $this->getTranslations($field)])),
        ];
    }
}
