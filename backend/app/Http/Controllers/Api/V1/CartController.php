<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private readonly CartService $carts) {}

    public function show(Request $request): CartResource
    {
        return CartResource::make($this->carts->load($this->carts->resolve($request->user('sanctum'), $request->header('X-Cart-Token'))));
    }

    public function store(Request $request): CartResource
    {
        $data = $request->validate(['variant_id' => ['required', 'integer', 'exists:product_variants,id'], 'quantity' => ['required', 'integer', 'between:1,100']]);
        $cart = $this->carts->resolve($request->user('sanctum'), $request->header('X-Cart-Token'));

        return CartResource::make($this->carts->add($cart, $data['variant_id'], $data['quantity']));
    }

    public function update(Request $request, int $item): CartResource
    {
        $data = $request->validate(['quantity' => ['required', 'integer', 'between:0,100']]);
        $cart = $this->carts->resolve($request->user('sanctum'), $request->header('X-Cart-Token'));

        return CartResource::make($this->carts->update($cart, $item, $data['quantity']));
    }

    public function destroy(Request $request, int $item): JsonResponse
    {
        $cart = $this->carts->resolve($request->user('sanctum'), $request->header('X-Cart-Token'));
        $cart->items()->whereKey($item)->delete();

        return response()->json(['message' => 'Item removed.']);
    }

    public function clear(Request $request): JsonResponse
    {
        $this->carts->resolve($request->user('sanctum'), $request->header('X-Cart-Token'))->items()->delete();

        return response()->json(['message' => 'Cart cleared.']);
    }

    public function merge(Request $request): CartResource
    {
        $data = $request->validate(['guest_token' => ['required', 'uuid']]);

        return CartResource::make($this->carts->merge($request->user(), $data['guest_token']));
    }
}
