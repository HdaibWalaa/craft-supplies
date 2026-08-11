<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public function __construct(private readonly CartService $carts, private readonly DiscountService $discounts) {}

    public function create(?User $user, array $data): Order
    {
        return DB::transaction(function () use ($user, $data): Order {
            $cart = $this->carts->resolve($user, $data['cart_token'] ?? null);
            $cart->load('items.variant.product');
            if ($cart->items->isEmpty()) {
                throw ValidationException::withMessages(['cart' => ['Your cart is empty.']]);
            }
            $subtotal = 0;
            foreach ($cart->items as $item) {
                $variant = ProductVariant::query()->whereKey($item->product_variant_id)->lockForUpdate()->firstOrFail();
                if (! $variant->is_active || $item->quantity > $variant->stock) {
                    throw ValidationException::withMessages(['cart' => ["Insufficient stock for {$item->variant->product->name}."]]);
                }
                $subtotal += $this->cents($variant->sale_price ?? $variant->price) * $item->quantity;
            }
            [$discount, $discountAmount] = $this->discounts->validate($data['discount_code'] ?? null, $subtotal, true);
            $shipping = $data['shipping_method'] === 'express' ? 1899 : ($subtotal >= 7500 ? 0 : 699);
            $tax = (int) round(max(0, $subtotal - $discountAmount) * 0.0725);
            $total = $subtotal - $discountAmount + $shipping + $tax;
            $simulated = config('services.stripe.secret') === null || config('checkout.simulated');
            $order = Order::query()->create([
                'order_number' => 'KW-'.Str::upper(Str::random(10)), 'access_token' => (string) Str::uuid(), 'user_id' => $user?->id, 'discount_code_id' => $discount?->id,
                'email' => $data['email'], 'status' => $simulated ? OrderStatus::Paid : OrderStatus::Pending,
                'payment_status' => $simulated ? PaymentStatus::Paid : PaymentStatus::Pending, 'payment_method' => $simulated ? 'simulated' : 'stripe',
                'shipping_method' => $data['shipping_method'], 'shipping_address' => $data['shipping_address'],
                'billing_address' => $data['billing_address'] ?? $data['shipping_address'], 'subtotal' => $subtotal / 100,
                'discount_total' => $discountAmount / 100, 'shipping_total' => $shipping / 100, 'tax_total' => $tax / 100,
                'total' => $total / 100, 'currency' => 'USD', 'paid_at' => $simulated ? now() : null,
            ]);
            foreach ($cart->items as $item) {
                $variant = ProductVariant::query()->whereKey($item->product_variant_id)->lockForUpdate()->firstOrFail();
                $unit = $this->cents($variant->sale_price ?? $variant->price);
                $order->items()->create(['product_id' => $variant->product_id, 'product_variant_id' => $variant->id, 'product_name' => $variant->product->name,
                    'variant_name' => $variant->name, 'sku' => $variant->sku, 'unit_price' => $unit / 100, 'quantity' => $item->quantity,
                    'subtotal' => ($unit * $item->quantity) / 100, 'snapshot' => ['product_slug' => $variant->product->slug]]);
                $variant->decrement('stock', $item->quantity);
            }
            $order->payments()->create(['provider' => $simulated ? 'simulated' : 'stripe', 'status' => $simulated ? PaymentStatus::Paid : PaymentStatus::Pending, 'amount' => $total / 100, 'currency' => 'USD']);
            if ($discount) {
                $discount->increment('usage_count');
                DB::table('discount_usages')->insert(['discount_code_id' => $discount->id, 'order_id' => $order->id, 'user_id' => $user?->id, 'amount' => $discountAmount / 100, 'created_at' => now(), 'updated_at' => now()]);
            }
            $cart->items()->delete();

            return $order->load(['items', 'payments']);
        });
    }

    private function cents(string|float|int $amount): int
    {
        return (int) round((float) $amount * 100);
    }

    public function cancelReservation(Order $order): void
    {
        DB::transaction(function () use ($order): void {
            $order = Order::query()->with('items')->lockForUpdate()->findOrFail($order->id);
            if ($order->payment_status !== PaymentStatus::Pending) {
                return;
            }
            foreach ($order->items as $item) {
                if ($item->product_variant_id) {
                    ProductVariant::query()->whereKey($item->product_variant_id)->increment('stock', $item->quantity);
                }
            }
            if ($order->discount_code_id) {
                DB::table('discount_codes')->where('id', $order->discount_code_id)->where('usage_count', '>', 0)->decrement('usage_count');
                DB::table('discount_usages')->where('order_id', $order->id)->delete();
            }
            $order->update(['status' => OrderStatus::Cancelled, 'payment_status' => PaymentStatus::Failed]);
            $order->payments()->update(['status' => PaymentStatus::Failed]);
        });
    }
}
