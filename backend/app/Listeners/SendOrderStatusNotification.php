<?php

namespace App\Listeners;

use App\Events\OrderStatusChanged;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendOrderStatusNotification implements ShouldQueue
{
    public function handle(OrderStatusChanged $event): void
    {
        $order = $event->order;
        Mail::raw("Order {$order->order_number} is now {$order->status->value}.", fn ($mail) => $mail->to($order->email)->subject("Order {$order->order_number} update"));
    }
}
