<?php

namespace App\Console\Commands;

use App\Events\OrderPlaced;
use App\Models\Order;
use Illuminate\Console\Command;

class TestWhatsAppOrder extends Command
{
    protected $signature = 'whatsapp:test-order {orderId : Existing order ID}';

    protected $description = 'Queue the admin WhatsApp notification for an existing order';

    public function handle(): int
    {
        $order = Order::query()->with('items')->find($this->argument('orderId'));
        if (! $order) {
            $this->error('Order not found.');

            return self::FAILURE;
        }

        if (! config('whatsapp.enabled')) {
            $this->warn('WhatsApp is disabled. No Meta API request will be made.');
        } else {
            $this->warn('WhatsApp is enabled: this may send a real message to the configured admin number.');
            if (! $this->confirm('Queue the notification?', false)) {
                return self::SUCCESS;
            }
        }

        OrderPlaced::dispatch($order);
        $this->info('OrderPlaced dispatched. Duplicate protection will skip an already-notified order.');

        return self::SUCCESS;
    }
}
