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
    public function __construct(private readonly CartService $carts, private readonly DiscountService $discounts, private readonly ShippingRateResolver $shippingRates) {}

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
            $shippingRate = $this->shippingRates->rateFor($data['governorate'], $data['shipping_method_id'], true);
            if (! $shippingRate) {
                throw ValidationException::withMessages(['shipping_method_id' => ['No active delivery rate is available for the selected governorate and method.']]);
            }
            $shippingMethod = $shippingRate->method;
            $shippingZone = $shippingRate->zone;
            $shipping = $this->cents($shippingRate->price);
            $tax = (int) round(max(0, $subtotal - $discountAmount) * 0.0725);
            $total = $subtotal - $discountAmount + $shipping + $tax;
            $simulated = config('services.stripe.secret') === null || config('checkout.simulated');
            $order = Order::query()->create([
                'order_number' => 'KW-'.Str::upper(Str::random(10)), 'access_token' => (string) Str::uuid(), 'user_id' => $user?->id, 'discount_code_id' => $discount?->id,
                'email' => $user?->email, 'status' => OrderStatus::Pending,
                'payment_status' => PaymentStatus::Pending, 'payment_method' => $simulated ? 'simulated' : 'stripe',
                'shipping_method' => (string) $shippingMethod->id, 'shipping_method_id' => $shippingMethod->id,
                'shipping_zone_id' => $shippingZone->id, 'shipping_zone_name' => $shippingZone->getTranslation('name', app()->getLocale()),
                'shipping_method_name' => $shippingMethod->getTranslation('name', app()->getLocale()),
                'shipping_estimated_days_min' => $shippingRate->estimated_days_min, 'shipping_estimated_days_max' => $shippingRate->estimated_days_max,
                'shipping_address' => $this->addressSnapshot($data), 'billing_address' => $this->addressSnapshot($data), 'subtotal' => $subtotal / 100,
                'discount_total' => $discountAmount / 100, 'shipping_total' => $shipping / 100, 'tax_total' => $tax / 100,
                'total' => $total / 100, 'currency' => 'JOD', 'paid_at' => null,
            ]);
            if ($user && ($data['save_address'] ?? false)) {
                $hasAddresses = $user->addresses()->exists();
                $user->addresses()->create([...$this->addressSnapshot($data), 'is_default_shipping' => ! $hasAddresses]);
            }
            foreach ($cart->items as $item) {
                $variant = ProductVariant::query()->whereKey($item->product_variant_id)->lockForUpdate()->firstOrFail();
                $unit = $this->cents($variant->sale_price ?? $variant->price);
                $order->items()->create(['product_id' => $variant->product_id, 'product_variant_id' => $variant->id, 'product_name' => $variant->product->name,
                    'variant_name' => $variant->name, 'sku' => $variant->sku, 'unit_price' => $unit / 100, 'quantity' => $item->quantity,
                    'subtotal' => ($unit * $item->quantity) / 100, 'snapshot' => ['product_slug' => $variant->product->slug]]);
                $variant->decrement('stock', $item->quantity);
            }
            $order->payments()->create(['provider' => $simulated ? 'simulated' : 'stripe', 'status' => PaymentStatus::Pending, 'amount' => $total / 100, 'currency' => 'JOD']);
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

    private function addressSnapshot(array $data): array
    {
        return ['full_name' => $data['full_name'], 'phone' => $data['phone'], 'governorate' => $data['governorate'],
            'address' => $data['address'], 'country_code' => 'JO'];
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
