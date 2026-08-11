<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cart_uses_server_price_and_enforces_stock(): void
    {
        $variant = $this->variant(3, 9.99);
        $cart = $this->getJson('/api/v1/cart')->assertOk()->json('data');
        $this->withHeader('X-Cart-Token', $cart['token'])->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 2])
            ->assertOk()->assertJsonPath('data.subtotal', 19.98);
        $this->withHeader('X-Cart-Token', $cart['token'])->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 2])
            ->assertUnprocessable()->assertJsonValidationErrors('quantity');
    }

    public function test_guest_cart_merges_into_existing_customer_cart(): void
    {
        $variant = $this->variant(10, 5);
        $guest = $this->getJson('/api/v1/cart')->json('data');
        $this->withHeader('X-Cart-Token', $guest['token'])->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 2]);
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $this->withToken($token)->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);
        $this->withToken($token)->postJson('/api/v1/cart/merge', ['guest_token' => $guest['token']])->assertOk()->assertJsonPath('data.items.0.quantity', 3);
        $this->assertDatabaseMissing('carts', ['token' => $guest['token']]);
    }

    private function variant(int $stock, float $price)
    {
        $category = Category::query()->create(['name' => ['en' => 'Test'], 'slug' => 'test', 'is_active' => true]);
        $product = Product::query()->create(['category_id' => $category->id, 'name' => ['en' => 'Item'], 'slug' => 'item', 'short_description' => ['en' => 'Item'], 'description' => ['en' => 'Item'], 'base_price' => $price, 'status' => 'active', 'is_visible' => true]);

        return $product->variants()->create(['name' => ['en' => 'Default'], 'sku' => 'ITEM-1', 'price' => $price, 'stock' => $stock, 'is_active' => true]);
    }
}
