<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'coverImageTheme' => 'terracotta',
            'featuredImage' => $this->whenLoaded('media', fn () => MediaResource::make($this->getFirstMedia('featured_image'))),
            'publishedAt' => $this->published_at?->toISOString(),
            'metaTitle' => $this->meta_title,
            'metaDescription' => $this->meta_description,
            'relatedProducts' => $this->whenLoaded('products', fn () => $this->products->map(fn ($product) => ['product' => ProductResource::make($product)])),
            'translations' => $this->when($request->boolean('translations'), fn () => collect($this->translatable)->mapWithKeys(fn ($field) => [$field => $this->getTranslations($field)])),
        ];
    }
}
