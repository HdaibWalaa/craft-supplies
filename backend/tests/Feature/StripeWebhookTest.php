<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_rejects_invalid_signature(): void
    {
        config(['services.stripe.webhook_secret' => 'whsec_test']);
        $this->call('POST', '/api/v1/webhooks/stripe', server: ['CONTENT_TYPE' => 'application/json', 'HTTP_STRIPE_SIGNATURE' => 'invalid'], content: '{"id":"evt_test"}')
            ->assertStatus(400)->assertJsonPath('message', 'Invalid Stripe signature.');
        $this->assertDatabaseCount('webhook_events', 0);
    }

    public function test_verified_completed_webhook_marks_only_payment_paid(): void
    {
        config(['services.stripe.webhook_secret' => 'whsec_test']);
        $order = $this->pendingStripeOrder();
        $payload = json_encode(['id' => 'evt_paid', 'type' => 'checkout.session.completed', 'data' => ['object' => ['metadata' => ['order_id' => (string) $order->id]]]], JSON_THROW_ON_ERROR);

        $this->stripeWebhook($payload)->assertOk();

        $order->refresh();
        $this->assertSame(OrderStatus::Pending, $order->status);
        $this->assertSame(PaymentStatus::Paid, $order->payment_status);
        $this->assertNotNull($order->paid_at);
        $this->assertDatabaseHas('payments', ['order_id' => $order->id, 'status' => 'paid']);
    }

    public function test_expired_stripe_session_never_marks_payment_paid(): void
    {
        config(['services.stripe.webhook_secret' => 'whsec_test']);
        $order = $this->pendingStripeOrder();
        $payload = json_encode(['id' => 'evt_expired', 'type' => 'checkout.session.expired', 'data' => ['object' => ['metadata' => ['order_id' => (string) $order->id]]]], JSON_THROW_ON_ERROR);

        $this->stripeWebhook($payload)->assertOk();
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'cancelled', 'payment_status' => 'failed', 'paid_at' => null]);
    }

    private function stripeWebhook(string $payload)
    {
        $timestamp = time();
        $signature = 't='.$timestamp.',v1='.hash_hmac('sha256', $timestamp.'.'.$payload, 'whsec_test');
        return $this->call('POST', '/api/v1/webhooks/stripe', server: ['CONTENT_TYPE' => 'application/json', 'HTTP_STRIPE_SIGNATURE' => $signature], content: $payload);
    }

    private function pendingStripeOrder(): Order
    {
        $order = Order::query()->create(['order_number' => 'KW-WEBHOOK', 'access_token' => fake()->uuid(), 'status' => OrderStatus::Pending,
            'payment_status' => PaymentStatus::Pending, 'payment_method' => 'stripe', 'shipping_method' => '1', 'shipping_address' => [], 'billing_address' => [],
            'subtotal' => 10, 'discount_total' => 0, 'shipping_total' => 3, 'tax_total' => 0, 'total' => 13, 'currency' => 'JOD']);
        $order->payments()->create(['provider' => 'stripe', 'status' => PaymentStatus::Pending, 'amount' => 13, 'currency' => 'JOD']);
        return $order;
    }
}
