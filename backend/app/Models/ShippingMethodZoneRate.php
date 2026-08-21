<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingMethodZoneRate extends Model
{
    protected $fillable = ['shipping_method_id', 'shipping_zone_id', 'price', 'estimated_days_min', 'estimated_days_max', 'is_active', 'is_default'];
    protected function casts(): array { return ['price' => 'decimal:2', 'estimated_days_min' => 'integer', 'estimated_days_max' => 'integer', 'is_active' => 'boolean', 'is_default' => 'boolean']; }
    public function method() { return $this->belongsTo(ShippingMethod::class, 'shipping_method_id'); }
    public function zone() { return $this->belongsTo(ShippingZone::class, 'shipping_zone_id'); }
}
