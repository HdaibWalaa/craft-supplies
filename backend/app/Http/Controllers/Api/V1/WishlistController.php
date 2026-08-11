<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $items = Wishlist::query()->where('user_id', $request->user()->id)->with(['product.category', 'product.variants', 'product.media'])->latest()->get();

        return ProductResource::collection($items->pluck('product'));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['product_id' => ['required', 'integer', 'exists:products,id']]);
        Wishlist::query()->firstOrCreate(['user_id' => $request->user()->id, 'product_id' => $data['product_id']]);

        return response()->json(['message' => 'Added to wishlist.'], 201);
    }

    public function destroy(Request $request, int $product): JsonResponse
    {
        Wishlist::query()->where('user_id', $request->user()->id)->where('product_id', $product)->delete();

        return response()->json(['message' => 'Removed from wishlist.']);
    }
}
