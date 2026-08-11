<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\DiscountCode;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_calculates_authoritative_totals_and_decrements_stock_atomically(): void
    {
        config(['checkout.simulated' => true]);
        $category = Category::query()->create(['name' => ['en' => 'Test'], 'slug' => 'test', 'is_active' => true]);
        $product = Product::query()->create(['category_id' => $category->id, 'name' => ['en' => 'Item'], 'slug' => 'item', 'short_description' => ['en' => 'Item'], 'description' => ['en' => 'Item'], 'base_price' => 20, 'status' => 'active', 'is_visible' => true]);
        $variant = $product->variants()->create(['name' => ['en' => 'Default'], 'sku' => 'ITEM-1', 'price' => 20, 'stock' => 5, 'is_active' => true]);
        DiscountCode::query()->create(['code' => 'TENOFF', 'type' => 'percentage', 'value' => 10, 'minimum_spend' => 0, 'is_active' => true]);
        $cart = $this->getJson('/api/v1/cart')->json('data');
        $this->withHeader('X-Cart-Token', $cart['token'])->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 2]);
        $response = $this->postJson('/api/v1/checkout', [...$this->checkoutPayload($cart['token']), 'discount_code' => 'TENOFF']);
        $response->assertCreated()->assertJsonPath('data.order.subtotal', 40)->assertJsonPath('data.order.discountTotal', 4)->assertJsonPath('data.order.shippingTotal', 6.99)->assertJsonPath('data.order.taxTotal', 2.61)->assertJsonPath('data.order.total', 45.6);
        $this->assertDatabaseHas('product_variants', ['id' => $variant->id, 'stock' => 3]);
        $this->assertDatabaseHas('orders', ['payment_status' => 'paid', 'total' => 45.60]);
    }

    public function test_checkout_rejects_stock_changed_after_item_was_added(): void
    {
        $category = Category::query()->create(['name' => ['en' => 'Test'], 'slug' => 'test', 'is_active' => true]);
        $product = Product::query()->create(['category_id' => $category->id, 'name' => ['en' => 'Item'], 'slug' => 'item', 'short_description' => ['en' => 'Item'], 'description' => ['en' => 'Item'], 'base_price' => 20, 'status' => 'active', 'is_visible' => true]);
        $variant = $product->variants()->create(['name' => ['en' => 'Default'], 'sku' => 'ITEM-1', 'price' => 20, 'stock' => 2, 'is_active' => true]);
        $cart = $this->getJson('/api/v1/cart')->json('data');
        $this->withHeader('X-Cart-Token', $cart['token'])->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 2]);
        $variant->update(['stock' => 1]);
        $this->postJson('/api/v1/checkout', $this->checkoutPayload($cart['token']))->assertUnprocessable()->assertJsonValidationErrors('cart');
        $this->assertDatabaseCount('orders', 0);
    }

    private function checkoutPayload(string $token): array
    {
        return ['cart_token' => $token, 'email' => 'buyer@example.test', 'shipping_method' => 'standard', 'shipping_address' => [
            'first_name' => 'Test', 'last_name' => 'Buyer', 'line_1' => '123 Maker St', 'city' => 'Amman', 'region' => 'Amman', 'postal_code' => '11118', 'country_code' => 'JO',
        ]];
    }
}
