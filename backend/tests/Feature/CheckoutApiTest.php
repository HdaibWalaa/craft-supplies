<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Category;
use App\Models\DiscountCode;
use App\Models\Product;
use App\Models\ShippingMethod;
use App\Models\ShippingZone;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CheckoutApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_uses_database_shipping_and_stores_snapshots(): void
    {
        [$variant, $token] = $this->cartWithItem(20, 5, 2);
        $method = $this->shippingMethod(3.25);
        DiscountCode::query()->create(['code' => 'TENOFF', 'type' => 'percentage', 'value' => 10, 'minimum_spend' => 0, 'is_active' => true]);

        $response = $this->postJson('/api/v1/checkout', [...$this->payload($token, $method->id), 'discount_code' => 'TENOFF', 'shipping_price' => 0.01]);

        $response->assertCreated()->assertJsonPath('data.order.subtotal', 40)->assertJsonPath('data.order.discountTotal', 4)
            ->assertJsonPath('data.order.shippingTotal', 3.25)->assertJsonPath('data.order.shippingMethod.name', 'Standard Delivery')
            ->assertJsonPath('data.order.status', 'pending')->assertJsonPath('data.order.paymentStatus', 'pending');
        $orderId = $response->json('data.order.id');
        $this->assertDatabaseHas('orders', ['id' => $orderId, 'status' => 'pending', 'payment_status' => 'pending', 'paid_at' => null, 'shipping_total' => 3.25, 'shipping_method_id' => $method->id, 'shipping_method_name' => 'Standard Delivery', 'shipping_zone_name' => 'Amman']);
        $this->assertDatabaseHas('payments', ['order_id' => $orderId, 'status' => 'pending']);
        $this->assertSame(['full_name' => 'Test Buyer', 'phone' => '0790000000', 'governorate' => 'amman', 'address' => 'Jubeiha, Building 15', 'country_code' => 'JO'], $response->json('data.order.shippingAddress'));
        $method->zoneRates()->whereHas('zone', fn ($query) => $query->where('slug', 'amman'))->update(['price' => 9.50]);
        $method->update(['name' => ['ar' => 'توصيل معدل', 'en' => 'Changed Delivery']]);
        $this->assertDatabaseHas('orders', ['id' => $orderId, 'shipping_total' => 3.25, 'shipping_method_name' => 'Standard Delivery']);
        $this->assertDatabaseHas('product_variants', ['id' => $variant->id, 'stock' => 3]);
    }

    public function test_guest_checkout_works_without_email(): void
    {
        [, $token] = $this->cartWithItem();
        $response = $this->postJson('/api/v1/checkout', $this->payload($token, $this->shippingMethod()->id));
        $response->assertCreated();
        $orderId = $response->json('data.order.id');
        $this->assertDatabaseHas('orders', ['id' => $orderId, 'email' => null, 'user_id' => null]);
        $this->assertDatabaseHas('order_items', ['order_id' => $orderId, 'quantity' => 1]);
        $this->getJson('/api/v1/orders')->assertUnauthorized();
    }

    public function test_authenticated_checkout_can_save_first_address_as_default(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        [, $token] = $this->cartWithItem();
        $response = $this->postJson('/api/v1/checkout', [...$this->payload($token, $this->shippingMethod()->id), 'save_address' => true])->assertCreated();
        $this->assertDatabaseHas('orders', ['id' => $response->json('data.order.id'), 'user_id' => $user->id]);
        $this->assertDatabaseHas('addresses', ['user_id' => $user->id, 'full_name' => 'Test Buyer', 'governorate' => 'amman', 'country_code' => 'JO', 'is_default_shipping' => true]);
    }

    public function test_authenticated_checkout_does_not_save_address_when_unchecked(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        [, $token] = $this->cartWithItem();
        $this->postJson('/api/v1/checkout', [...$this->payload($token, $this->shippingMethod()->id), 'save_address' => false])->assertCreated();
        $this->assertDatabaseCount('addresses', 0);
    }

    public function test_checkout_rejects_inactive_shipping_method(): void
    {
        [, $token] = $this->cartWithItem();
        $method = $this->shippingMethod(3, false);
        $this->postJson('/api/v1/checkout', $this->payload($token, $method->id))->assertUnprocessable()->assertJsonValidationErrors('shipping_method_id');
    }

    public function test_checkout_recalculates_rate_for_submitted_governorate_and_ignores_client_price(): void
    {
        [, $token] = $this->cartWithItem();
        $method = $this->shippingMethod(3);
        $method->zoneRates()->whereHas('zone', fn ($query) => $query->where('slug', 'outside-amman'))->update(['price' => 5]);
        $response = $this->postJson('/api/v1/checkout', [...$this->payload($token, $method->id), 'governorate' => 'irbid', 'shipping_price' => 0.01]);
        $response->assertCreated()->assertJsonPath('data.order.shippingTotal', 5)->assertJsonPath('data.order.shippingZone.name', 'Outside Amman');
    }

    public function test_checkout_rejects_invalid_governorate(): void
    {
        [, $token] = $this->cartWithItem();
        $this->postJson('/api/v1/checkout', [...$this->payload($token, $this->shippingMethod()->id), 'governorate' => 'invalid'])->assertUnprocessable()->assertJsonValidationErrors('governorate');
    }

    public function test_checkout_requires_simplified_delivery_fields_and_shipping_method(): void
    {
        [, $token] = $this->cartWithItem();
        $this->postJson('/api/v1/checkout', ['cart_token' => $token])->assertUnprocessable()
            ->assertJsonValidationErrors(['full_name', 'phone', 'governorate', 'address', 'shipping_method_id']);
    }

    public function test_checkout_rejects_stock_changed_after_item_was_added(): void
    {
        [$variant, $token] = $this->cartWithItem(20, 2, 2);
        $variant->update(['stock' => 1]);
        $this->postJson('/api/v1/checkout', $this->payload($token, $this->shippingMethod()->id))->assertUnprocessable()->assertJsonValidationErrors('cart');
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_shipping_endpoint_is_active_sorted_and_localized(): void
    {
        ShippingMethod::query()->delete();
        $this->shippingMethod(8, true, 2, ['ar' => 'الثاني', 'en' => 'Second']);
        $this->shippingMethod(4, true, 1, ['ar' => 'الأول', 'en' => 'First']);
        $this->shippingMethod(1, false, 0, ['ar' => 'مخفي', 'en' => 'Hidden']);
        $this->withHeader('Accept-Language', 'ar')->getJson('/api/v1/shipping-methods?governorate=amman')->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('data.0.name', 'الأول');
        $this->withHeader('Accept-Language', 'en')->getJson('/api/v1/shipping-methods?governorate=amman')->assertOk()->assertJsonPath('data.0.name', 'First');
    }

    private function cartWithItem(float $price = 20, int $stock = 5, int $quantity = 1): array
    {
        $category = Category::query()->create(['name' => ['en' => 'Test'], 'slug' => 'test-'.fake()->unique()->word(), 'is_active' => true]);
        $product = Product::query()->create(['category_id' => $category->id, 'name' => ['en' => 'Item'], 'slug' => 'item-'.fake()->unique()->word(), 'short_description' => ['en' => 'Item'], 'description' => ['en' => 'Item'], 'base_price' => $price, 'status' => 'active', 'is_visible' => true]);
        $variant = $product->variants()->create(['name' => ['en' => 'Default'], 'sku' => 'ITEM-'.fake()->unique()->numerify('#####'), 'price' => $price, 'stock' => $stock, 'is_active' => true]);
        $cart = $this->getJson('/api/v1/cart')->json('data');
        $this->withHeader('X-Cart-Token', $cart['token'])->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => $quantity]);
        return [$variant, $cart['token']];
    }

    private function shippingMethod(float $price = 3, bool $active = true, int $sort = 1, ?array $name = null): ShippingMethod
    {
        $method = ShippingMethod::query()->create(['name' => $name ?? ['ar' => 'التوصيل العادي', 'en' => 'Standard Delivery'], 'description' => ['ar' => 'خلال 3 - 7 أيام', 'en' => 'Within 3-7 days'],
            'price' => $price, 'estimated_days_min' => 3, 'estimated_days_max' => 7, 'is_active' => $active, 'sort_order' => $sort]);
        foreach (ShippingZone::query()->get() as $zone) $method->zoneRates()->create(['shipping_zone_id' => $zone->id, 'price' => $price, 'estimated_days_min' => 3, 'estimated_days_max' => 7, 'is_active' => true, 'is_default' => $sort === 1]);
        return $method;
    }

    private function payload(string $token, int $shippingMethodId): array
    {
        return ['cart_token' => $token, 'full_name' => 'Test Buyer', 'phone' => '0790000000', 'governorate' => 'amman',
            'address' => 'Jubeiha, Building 15', 'shipping_method_id' => $shippingMethodId];
    }
}
