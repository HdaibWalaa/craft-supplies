<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class ShippingMethod extends Model
{
    use HasTranslations;

    public array $translatable = ['name', 'description'];

    protected $fillable = ['name', 'description', 'price', 'estimated_days_min', 'estimated_days_max', 'is_active', 'sort_order'];

    protected function casts(): array
    {
        return ['price' => 'decimal:2', 'estimated_days_min' => 'integer', 'estimated_days_max' => 'integer', 'is_active' => 'boolean', 'sort_order' => 'integer'];
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function zoneRates()
    {
        return $this->hasMany(ShippingMethodZoneRate::class);
    }
}
