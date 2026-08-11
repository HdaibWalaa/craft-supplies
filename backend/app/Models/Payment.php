<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = ['order_id', 'provider', 'provider_id', 'status', 'amount', 'currency', 'metadata'];

    protected function casts(): array
    {
        return ['status' => PaymentStatus::class, 'amount' => 'decimal:2', 'metadata' => 'array'];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
