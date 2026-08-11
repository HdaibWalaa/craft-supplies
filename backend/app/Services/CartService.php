<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function resolve(?User $user, ?string $token): Cart
    {
        if ($user) {
            return Cart::query()->firstOrCreate(['user_id' => $user->id], ['token' => (string) Str::uuid()]);
        }
        if ($token && ($cart = Cart::query()->where('token', $token)->whereNull('user_id')->first())) {
            return $cart;
        }

        return Cart::query()->create(['token' => (string) Str::uuid()]);
    }

    public function add(Cart $cart, int $variantId, int $quantity): Cart
    {
        return DB::transaction(function () use ($cart, $variantId, $quantity): Cart {
            $variant = ProductVariant::query()->whereKey($variantId)->where('is_active', true)->lockForUpdate()->firstOrFail();
            $item = $cart->items()->where('product_variant_id', $variant->id)->lockForUpdate()->first();
            $nextQuantity = ($item?->quantity ?? 0) + $quantity;
            if ($nextQuantity > $variant->stock) {
                throw ValidationException::withMessages(['quantity' => ["Only {$variant->stock} items are available."]]);
            }
            $cart->items()->updateOrCreate(['product_variant_id' => $variant->id], ['quantity' => $nextQuantity]);

            return $this->load($cart);
        });
    }

    public function update(Cart $cart, int $itemId, int $quantity): Cart
    {
        return DB::transaction(function () use ($cart, $itemId, $quantity): Cart {
            $item = $cart->items()->whereKey($itemId)->lockForUpdate()->firstOrFail();
            if ($quantity === 0) {
                $item->delete();
            } else {
                $variant = ProductVariant::query()->whereKey($item->product_variant_id)->lockForUpdate()->firstOrFail();
                if ($quantity > $variant->stock) {
                    throw ValidationException::withMessages(['quantity' => ["Only {$variant->stock} items are available."]]);
                }
                $item->update(['quantity' => $quantity]);
            }

            return $this->load($cart);
        });
    }

    public function merge(User $user, string $guestToken): Cart
    {
        return DB::transaction(function () use ($user, $guestToken): Cart {
            $target = Cart::query()->firstOrCreate(['user_id' => $user->id], ['token' => (string) Str::uuid()]);
            $guest = Cart::query()->where('token', $guestToken)->whereNull('user_id')->lockForUpdate()->first();
            if (! $guest || $guest->id === $target->id) {
                return $this->load($target);
            }
            foreach ($guest->items()->with('variant')->get() as $guestItem) {
                $existing = $target->items()->where('product_variant_id', $guestItem->product_variant_id)->first();
                $quantity = min(($existing?->quantity ?? 0) + $guestItem->quantity, $guestItem->variant->stock);
                if ($quantity > 0) {
                    $target->items()->updateOrCreate(['product_variant_id' => $guestItem->product_variant_id], ['quantity' => $quantity]);
                }
            }
            $guest->delete();

            return $this->load($target);
        });
    }

    public function load(Cart $cart): Cart
    {
        return $cart->fresh(['items.variant.product.category', 'items.variant.product.media', 'items.variant.product.variants']);
    }
}
