<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use App\Services\DiscountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscountController extends Controller
{
    public function __construct(private readonly DiscountService $discounts, private readonly CartService $carts) {}

    public function validateCode(Request $request): JsonResponse
    {
        $data = $request->validate(['code' => ['required', 'string', 'max:50'], 'cart_token' => ['nullable', 'uuid']]);
        $cart = $this->carts->load($this->carts->resolve($request->user('sanctum'), $data['cart_token'] ?? $request->header('X-Cart-Token')));
        $subtotal = $cart->items->sum(fn ($item) => (int) round((float) ($item->variant->sale_price ?? $item->variant->price) * 100) * $item->quantity);
        [, $amount] = $this->discounts->validate($data['code'], $subtotal);

        return response()->json(['data' => ['valid' => true, 'code' => strtoupper($data['code']), 'amount' => $amount / 100]]);
    }
}
