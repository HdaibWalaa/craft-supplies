<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Models\Order;
use App\Services\WhatsApp\MetaWhatsAppService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendAdminWhatsAppOrderNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public bool $afterCommit = true;

    public int $tries = 3;

    /** @var array<int, int> */
    public array $backoff = [30, 120, 300];

    public function handle(OrderPlaced $event, MetaWhatsAppService $whatsApp): void
    {
        if (! $whatsApp->enabled()) {
            Log::debug('Admin WhatsApp order notification skipped because it is disabled.', ['order_id' => $event->order->id]);

            return;
        }

        Cache::lock('admin-whatsapp-order:'.$event->order->id, 60)->block(5, function () use ($event, $whatsApp): void {
            $order = Order::query()->with(['items', 'user'])->findOrFail($event->order->id);
            if ($order->admin_whatsapp_notified_at !== null) {
                return;
            }

            $messageId = $whatsApp->sendNewOrderNotification($order);
            $order->forceFill([
                'admin_whatsapp_notified_at' => now(),
                'admin_whatsapp_message_id' => $messageId,
            ])->save();

            Log::info('Admin WhatsApp order notification sent.', [
                'order_id' => $order->id,
                'provider_message_id' => $messageId,
            ]);
        });
    }

    public function failed(OrderPlaced $event, Throwable $exception): void
    {
        Log::error('Admin WhatsApp order notification failed.', [
            'order_id' => $event->order->id,
            'exception' => $exception::class,
        ]);
    }
}
