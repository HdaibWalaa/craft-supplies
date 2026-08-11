<?php

namespace Tests\Feature;

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
}
