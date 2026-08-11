<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductIndexRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        return CategoryResource::collection(Category::query()->whereNull('parent_id')->where('is_active', true)->with('media')->withCount(['products' => fn ($q) => $q->where('status', 'active')->where('is_visible', true)])->orderBy('sort_order')->get());
    }

    public function show(string $slug): CategoryResource
    {
        return CategoryResource::make(Category::query()->where('slug', $slug)->where('is_active', true)->with(['media', 'children.media', 'attributes.values'])->withCount('products')->firstOrFail());
    }

    public function products(ProductIndexRequest $request, string $slug)
    {
        $category = Category::query()->where('slug', $slug)->where('is_active', true)->firstOrFail();
        $request->merge(['category' => $category->slug]);

        return app(ProductController::class)->index($request);
    }
}
