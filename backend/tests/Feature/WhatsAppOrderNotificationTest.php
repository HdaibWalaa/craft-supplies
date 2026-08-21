<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Events\OrderPlaced;
use App\Listeners\SendAdminWhatsAppOrderNotification;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ShippingMethod;
use App\Models\ShippingZone;
use App\Models\User;
use App\Services\WhatsApp\MetaWhatsAppService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Tests\TestCase;

class WhatsAppOrderNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'app.url' => 'https://backend.example.test',
            'whatsapp.enabled' => true,
            'whatsapp.api_version' => 'v23.0',
            'whatsapp.phone_number_id' => '123456789',
            'whatsapp.access_token' => 'test-secret-token',
            'whatsapp.admin_number' => '+962790000000',
            'whatsapp.message_mode' => 'template',
            'whatsapp.order_template' => 'admin_new_order_ar',
            'whatsapp.template_language' => 'ar',
            'whatsapp.order_item_limit' => 3,
        ]);
    }

    public function test_successful_notification_uses_admin_number_order_data_and_records_provider_id(): void
    {
        Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.test-1']]], 200)]);
        $order = $this->createOrder();

        app(SendAdminWhatsAppOrderNotification::class)->handle(new OrderPlaced($order), app(MetaWhatsAppService::class));

        Http::assertSent(function ($request): bool {
            $parameters = collect($request['template']['components'][0]['parameters'])->pluck('text');

            return $request->url() === 'https://graph.facebook.com/v23.0/123456789/messages'
                && $request['to'] === '962790000000'
                && $request['template']['name'] === 'admin_new_order_ar'
                && $request['template']['language']['code'] === 'ar'
                && $parameters->contains('KW-TEST-1')
                && $parameters->contains('Test Buyer')
                && $parameters->contains('45.60 USD');
        });
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'admin_whatsapp_message_id' => 'wamid.test-1',
        ]);
        $this->assertNotNull($order->fresh()->admin_whatsapp_notified_at);
    }

    public function test_disabled_integration_sends_no_request(): void
    {
        config(['whatsapp.enabled' => false]);
        Http::fake();

        app(SendAdminWhatsAppOrderNotification::class)->handle(new OrderPlaced($this->createOrder()), app(MetaWhatsAppService::class));

        Http::assertNothingSent();
    }

    public function test_duplicate_event_sends_only_once(): void
    {
        Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.once']]], 200)]);
        $order = $this->createOrder();
        $listener = app(SendAdminWhatsAppOrderNotification::class);

        $listener->handle(new OrderPlaced($order), app(MetaWhatsAppService::class));
        $listener->handle(new OrderPlaced($order), app(MetaWhatsAppService::class));

        Http::assertSentCount(1);
    }

    public function test_guest_and_authenticated_customer_data_are_safe(): void
    {
        $service = app(MetaWhatsAppService::class);
        $guest = $this->createOrder();
        $this->assertSame('Test Buyer', $service->templateParameters($guest)[1]);

        $user = User::factory()->create(['name' => 'Account Buyer']);
        $authenticated = $this->createOrder($user, ['first_name' => '', 'last_name' => '']);
        $this->assertSame('Account Buyer', $service->templateParameters($authenticated)[1]);
    }

    public function test_long_orders_are_limited(): void
    {
        $order = $this->createOrder();
        foreach (range(2, 6) as $index) {
            $order->items()->create(['product_name' => 'Item '.$index, 'variant_name' => 'Default', 'sku' => 'ITEM-'.$index, 'unit_price' => 1, 'quantity' => 1, 'subtotal' => 1]);
        }

        $summary = app(MetaWhatsAppService::class)->templateParameters($order->fresh('items'))[3];
        $this->assertStringContainsString('+ 3 منتجات أخرى', $summary);
        $this->assertSame(3, substr_count($summary, '•'));
    }

    public function test_failed_api_does_not_mark_order_and_listener_has_bounded_retries(): void
    {
        Http::fake(['graph.facebook.com/*' => Http::response(['error' => ['message' => 'Rejected']], 500)]);
        $order = $this->createOrder();
        $listener = app(SendAdminWhatsAppOrderNotification::class);

        $this->assertSame(3, $listener->tries);
        $this->assertSame([30, 120, 300], $listener->backoff);

        try {
            $listener->handle(new OrderPlaced($order), app(MetaWhatsAppService::class));
            $this->fail('Expected the queued listener to fail for retry.');
        } catch (RequestException) {
            $this->assertNull($order->fresh()->admin_whatsapp_notified_at);
        }
    }

    public function test_successful_simulated_checkout_dispatches_order_placed(): void
    {
        config(['checkout.simulated' => true, 'whatsapp.enabled' => false]);
        Event::fake([OrderPlaced::class]);
        [$variant, $token] = $this->cartWithItem();

        $this->postJson('/api/v1/checkout', $this->checkoutPayload($token))->assertCreated();

        Event::assertDispatched(OrderPlaced::class, fn (OrderPlaced $event) => $event->order->status === OrderStatus::Pending && $event->order->payment_status === PaymentStatus::Pending);
        $this->assertDatabaseHas('product_variants', ['id' => $variant->id, 'stock' => 4]);
    }

    public function test_failed_meta_api_does_not_roll_back_checkout(): void
    {
        config(['checkout.simulated' => true]);
        Http::fake(['graph.facebook.com/*' => Http::response(['error' => ['message' => 'Unavailable']], 503)]);
        [, $token] = $this->cartWithItem();

        $response = $this->postJson('/api/v1/checkout', $this->checkoutPayload($token))->assertCreated();
        $order = Order::query()->findOrFail($response->json('data.order.id'));

        try {
            app(SendAdminWhatsAppOrderNotification::class)->handle(new OrderPlaced($order), app(MetaWhatsAppService::class));
            $this->fail('Expected the isolated queued delivery to fail.');
        } catch (RequestException) {
            // The order was already committed before the asynchronous delivery attempt.
        }

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseHas('orders', ['status' => 'pending', 'payment_status' => 'pending', 'admin_whatsapp_notified_at' => null]);
        Http::assertSentCount(1);
    }

    public function test_failure_logging_never_includes_the_access_token(): void
    {
        Log::spy();
        $order = $this->createOrder();

        app(SendAdminWhatsAppOrderNotification::class)->failed(new OrderPlaced($order), new RuntimeException('test-secret-token'));

        Log::shouldHaveReceived('error')->once()->withArgs(function (string $message, array $context): bool {
            return $message === 'Admin WhatsApp order notification failed.'
                && ! str_contains(json_encode($context, JSON_THROW_ON_ERROR), 'test-secret-token');
        });
    }

    private function createOrder(?User $user = null, array $addressOverrides = []): Order
    {
        $order = Order::query()->create([
            'order_number' => 'KW-TEST-'.(Order::query()->count() + 1),
            'access_token' => fake()->uuid(),
            'user_id' => $user?->id,
            'email' => 'buyer@example.test',
            'status' => OrderStatus::Paid,
            'payment_status' => PaymentStatus::Paid,
            'payment_method' => 'simulated',
            'shipping_method' => 'standard',
            'shipping_address' => array_merge(['first_name' => 'Test', 'last_name' => 'Buyer', 'phone' => '0790000000', 'line_1' => '1 Maker Street', 'city' => 'Amman', 'country_code' => 'JO'], $addressOverrides),
            'billing_address' => [],
            'subtotal' => 40,
            'discount_total' => 2,
            'shipping_total' => 5,
            'tax_total' => 2.60,
            'total' => 45.60,
            'currency' => 'USD',
        ]);
        $order->items()->create(['product_name' => 'شمع الصويا', 'variant_name' => 'افتراضي', 'sku' => 'CND-001', 'unit_price' => 20, 'quantity' => 2, 'subtotal' => 40]);

        return $order->load(['items', 'user']);
    }

    private function cartWithItem(): array
    {
        $category = Category::query()->create(['name' => ['en' => 'Test'], 'slug' => 'whatsapp-test', 'is_active' => true]);
        $product = Product::query()->create(['category_id' => $category->id, 'name' => ['en' => 'Item'], 'slug' => 'whatsapp-item', 'short_description' => ['en' => 'Item'], 'description' => ['en' => 'Item'], 'base_price' => 20, 'status' => 'active', 'is_visible' => true]);
        $variant = $product->variants()->create(['name' => ['en' => 'Default'], 'sku' => 'WA-ITEM-1', 'price' => 20, 'stock' => 5, 'is_active' => true]);
        $cart = $this->getJson('/api/v1/cart')->json('data');
        $this->withHeader('X-Cart-Token', $cart['token'])->postJson('/api/v1/cart/items', ['variant_id' => $variant->id, 'quantity' => 1]);

        return [$variant, $cart['token']];
    }

    private function checkoutPayload(string $token): array
    {
        $method = ShippingMethod::query()->create(['name' => ['ar' => 'توصيل', 'en' => 'Delivery'], 'price' => 5, 'estimated_days_min' => 1, 'estimated_days_max' => 2, 'is_active' => true]);
        foreach (ShippingZone::query()->get() as $zone) $method->zoneRates()->create(['shipping_zone_id' => $zone->id, 'price' => 5, 'estimated_days_min' => 1, 'estimated_days_max' => 2, 'is_active' => true, 'is_default' => true]);
        return ['cart_token' => $token, 'full_name' => 'Test Buyer', 'phone' => '0790000000', 'governorate' => 'amman',
            'address' => '1 Maker Street', 'shipping_method_id' => $method->id];
    }
}
