<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductIndexRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\TestimonialResource;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Database\Eloquent\Builder;

class ProductController extends Controller
{
    public function index(ProductIndexRequest $request)
    {
        $data = $request->validated();
        $query = Product::query()
            ->where('status', ProductStatus::Active)
            ->where('is_visible', true)
            ->with(['category.media', 'variants' => fn ($query) => $query->where('is_active', true), 'media']);

        $query->when($data['category'] ?? null, fn (Builder $q, string $slug) => $q->whereHas('category', fn (Builder $category) => $category->where('slug', $slug)));
        $query->when($data['min_price'] ?? null, fn (Builder $q, $price) => $q->where('base_price', '>=', $price));
        $query->when($data['max_price'] ?? null, fn (Builder $q, $price) => $q->where('base_price', '<=', $price));
        $query->when($request->boolean('in_stock'), fn (Builder $q) => $q->whereHas('variants', fn (Builder $variant) => $variant->where('is_active', true)->where('stock', '>', 0)));
        foreach (['featured' => 'is_featured', 'new_arrival' => 'is_new_arrival', 'bundle' => 'is_bundle'] as $input => $column) {
            $query->when($request->has($input), fn (Builder $q) => $q->where($column, $request->boolean($input)));
        }
        if ($term = $data['q'] ?? null) {
            $query->where(function (Builder $q) use ($term): void {
                $driver = $q->getConnection()->getDriverName();
                if ($driver === 'pgsql') {
                    $q->whereRaw('name::text ILIKE ? OR short_description::text ILIKE ? OR description::text ILIKE ?', array_fill(0, 3, "%{$term}%"));
                } else {
                    $q->where('name', 'like', "%{$term}%")->orWhere('short_description', 'like', "%{$term}%")->orWhere('description', 'like', "%{$term}%");
                }
            });
        }

        match ($data['sort'] ?? 'newest') {
            'price_asc' => $query->orderBy('base_price'),
            'price_desc' => $query->orderByDesc('base_price'),
            'rating' => $query->orderByDesc('rating'),
            'popularity' => $query->orderByDesc('review_count'),
            default => $query->latest(),
        };

        return ProductResource::collection($query->paginate($data['per_page'] ?? 12)->withQueryString());
    }

    public function show(string $slug): ProductResource
    {
        $product = Product::query()->where('slug', $slug)->where('status', ProductStatus::Active)->where('is_visible', true)
            ->with(['category.media', 'variants' => fn ($q) => $q->where('is_active', true), 'media', 'attributeValues.attribute', 'attributeValues.option', 'relatedProducts.variants', 'relatedProducts.media', 'reviews' => fn ($q) => $q->where('status', 'approved')->latest(), 'reviews.media'])
            ->firstOrFail();

        return ProductResource::make($product);
    }

    public function testimonials()
    {
        $publicProduct = fn ($query) => $query
            ->where('status', ProductStatus::Active)
            ->where('is_visible', true);

        $reviews = Review::query()
            ->where('status', 'approved')
            ->where('rating', 5)
            ->whereNotNull('comment')
            ->whereHas('product', $publicProduct)
            ->with(['product' => $publicProduct])
            ->latest()
            ->limit(3)
            ->get();

        return TestimonialResource::collection($reviews);
    }
}
