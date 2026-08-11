<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = ['order_id', 'product_id', 'product_variant_id', 'product_name', 'variant_name', 'sku', 'unit_price', 'quantity', 'subtotal', 'snapshot'];

    protected function casts(): array
    {
        return ['unit_price' => 'decimal:2', 'subtotal' => 'decimal:2', 'snapshot' => 'array'];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
