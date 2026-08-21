<?php

namespace App\Models;

use App\Enums\JordanGovernorate;
use Illuminate\Database\Eloquent\Model;

class ShippingZoneGovernorate extends Model
{
    protected $fillable = ['shipping_zone_id', 'governorate'];
    protected function casts(): array { return ['governorate' => JordanGovernorate::class]; }
    public function zone() { return $this->belongsTo(ShippingZone::class, 'shipping_zone_id'); }
}
