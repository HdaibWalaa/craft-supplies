<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate(['author_name' => ['required', 'string', 'between:2,60'], 'rating' => ['required', 'integer', 'between:1,5'], 'title' => ['nullable', 'string', 'max:100'], 'comment' => ['required', 'string', 'between:5,1000'], 'images' => ['nullable', 'array', 'max:4'], 'images.*' => ['image', 'mimes:jpeg,png,webp', 'max:5120']]);
        $images = $data['images'] ?? [];
        unset($data['images']);
        $review = $product->reviews()->create([...$data, 'user_id' => $request->user('sanctum')?->id, 'status' => 'pending']);
        foreach ($images as $image) {
            $review->addMedia($image)->toMediaCollection('review_images');
        }

        return response()->json(['message' => 'Your review was submitted for moderation.'], 201);
    }
}
