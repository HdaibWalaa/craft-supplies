<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        try {
            $event = Webhook::constructEvent($request->getContent(), $request->header('Stripe-Signature', ''), config('services.stripe.webhook_secret'));
        } catch (\UnexpectedValueException|SignatureVerificationException) {
            return response()->json(['message' => 'Invalid Stripe signature.'], 400);
        }
        DB::transaction(function () use ($event): void {
            $inserted = DB::table('webhook_events')->insertOrIgnore(['provider' => 'stripe', 'event_id' => $event->id, 'type' => $event->type, 'payload' => json_encode($event->toArray()), 'created_at' => now(), 'updated_at' => now()]);
            if (! $inserted) {
                return;
            }
            if ($event->type === 'checkout.session.completed') {
                $orderId = $event->data->object->metadata->order_id ?? null;
                if ($orderId) {
                    $order = Order::query()->lockForUpdate()->find($orderId);
                    if ($order && $order->payment_status !== PaymentStatus::Paid) {
                        $order->update(['payment_status' => PaymentStatus::Paid, 'paid_at' => now()]);
                        $order->payments()->where('provider', 'stripe')->update(['status' => PaymentStatus::Paid]);
                    }
                }
            }
            if ($event->type === 'checkout.session.expired') {
                $orderId = $event->data->object->metadata->order_id ?? null;
                $order = $orderId ? Order::query()->with('items')->lockForUpdate()->find($orderId) : null;
                if ($order && $order->payment_status === PaymentStatus::Pending) {
                    foreach ($order->items as $item) {
                        if ($item->product_variant_id) {
                            DB::table('product_variants')->where('id', $item->product_variant_id)->increment('stock', $item->quantity);
                        }
                    }
                    if ($order->discount_code_id) {
                        DB::table('discount_codes')->where('id', $order->discount_code_id)->where('usage_count', '>', 0)->decrement('usage_count');
                        DB::table('discount_usages')->where('order_id', $order->id)->delete();
                    }
                    $order->update(['status' => \App\Enums\OrderStatus::Cancelled, 'payment_status' => PaymentStatus::Failed]);
                    $order->payments()->where('provider', 'stripe')->update(['status' => PaymentStatus::Failed]);
                }
            }
            DB::table('webhook_events')->where('event_id', $event->id)->update(['processed_at' => now()]);
        });

        return response()->json(['received' => true]);
    }
}
