<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Events\OrderStatusChanged;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = ['order_number', 'access_token', 'user_id', 'discount_code_id', 'email', 'status', 'payment_status', 'payment_method', 'shipping_method', 'shipping_method_id', 'shipping_zone_id', 'shipping_zone_name', 'shipping_method_name', 'shipping_estimated_days_min', 'shipping_estimated_days_max', 'shipping_address', 'billing_address', 'subtotal', 'discount_total', 'shipping_total', 'tax_total', 'total', 'currency', 'paid_at', 'admin_whatsapp_notified_at', 'admin_whatsapp_message_id'];

    protected function casts(): array
    {
        return ['status' => OrderStatus::class, 'payment_status' => PaymentStatus::class, 'shipping_address' => 'array', 'billing_address' => 'array', 'subtotal' => 'decimal:2', 'discount_total' => 'decimal:2', 'shipping_total' => 'decimal:2', 'tax_total' => 'decimal:2', 'total' => 'decimal:2', 'paid_at' => 'datetime', 'admin_whatsapp_notified_at' => 'datetime'];
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shippingMethod()
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function shippingZone()
    {
        return $this->belongsTo(ShippingZone::class);
    }

    protected static function booted(): void
    {
        static::updated(function (Order $order): void {
            if ($order->wasChanged('status')) {
                $previous = $order->getOriginal('status');
                event(new OrderStatusChanged($order, $previous instanceof OrderStatus ? $previous->value : (string) $previous));
            }
        });
    }
}
