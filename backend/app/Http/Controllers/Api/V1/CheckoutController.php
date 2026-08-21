<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\OrderPlaced;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;
use Throwable;

class CheckoutController extends Controller
{
    public function __construct(private readonly CheckoutService $checkout) {}

    public function store(CheckoutRequest $request): JsonResponse
    {
        $order = $this->checkout->create($request->user('sanctum'), $request->validated());
        if ($order->payment_method === 'simulated') {
            $this->dispatchOrderPlaced($order);

            return response()->json(['data' => ['order' => OrderResource::make($order), 'checkout_url' => null]], 201);
        }
        try {
            $stripe = new StripeClient(config('services.stripe.secret'));
            $session = $stripe->checkout->sessions->create([
                'mode' => 'payment', ...($order->email ? ['customer_email' => $order->email] : []),
                'line_items' => [[
                    'price_data' => ['currency' => strtolower($order->currency), 'unit_amount' => (int) round((float) $order->total * 100), 'product_data' => ['name' => "Craft Supplies order {$order->order_number}"]],
                    'quantity' => 1,
                ]],
                'metadata' => ['order_id' => (string) $order->id, 'order_number' => $order->order_number],
                'success_url' => rtrim(config('app.frontend_url'), '/').'/checkout/success?order='.$order->order_number.'&token='.$order->access_token,
                'cancel_url' => rtrim(config('app.frontend_url'), '/').'/checkout',
            ], ['idempotency_key' => 'checkout-'.$order->id]);
        } catch (Throwable $error) {
            $this->checkout->cancelReservation($order);
            report($error);

            return response()->json(['message' => 'Payment checkout could not be started. Please try again.'], 502);
        }
        $order->payments()->where('provider', 'stripe')->update(['provider_id' => $session->id, 'metadata' => ['url' => $session->url]]);
        $this->dispatchOrderPlaced($order);

        return response()->json(['data' => ['order' => OrderResource::make($order), 'checkout_url' => $session->url]], 201);
    }

    public function status(Request $request, string $orderNumber): OrderResource
    {
        $request->validate(['token' => ['required', 'uuid']]);

        return OrderResource::make(Order::query()->where('order_number', $orderNumber)->where('access_token', $request->query('token'))->with('items')->firstOrFail());
    }

    private function dispatchOrderPlaced(Order $order): void
    {
        try {
            OrderPlaced::dispatch($order);
        } catch (Throwable $exception) {
            Log::error('Order was placed but its post-order notification could not be queued.', [
                'order_id' => $order->id,
                'exception' => $exception::class,
            ]);
            report($exception);
        }
    }
}
