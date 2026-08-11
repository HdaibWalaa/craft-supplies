<?php

namespace App\Models;

use App\Enums\DiscountType;
use Illuminate\Database\Eloquent\Model;

class DiscountCode extends Model
{
    protected $fillable = ['code', 'type', 'value', 'minimum_spend', 'usage_limit', 'usage_count', 'is_active', 'starts_at', 'ends_at'];

    protected function casts(): array
    {
        return ['type' => DiscountType::class, 'value' => 'decimal:2', 'minimum_spend' => 'decimal:2', 'is_active' => 'boolean', 'starts_at' => 'datetime', 'ends_at' => 'datetime'];
    }
}
