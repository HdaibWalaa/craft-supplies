<?php

namespace App\Services;

use App\Enums\JordanGovernorate;
use App\Models\ShippingMethodZoneRate;
use App\Models\ShippingZone;
use Illuminate\Database\Eloquent\Collection;

class ShippingRateResolver
{
    public function zoneFor(JordanGovernorate|string $governorate, bool $lock = false): ?ShippingZone
    {
        $code = $governorate instanceof JordanGovernorate ? $governorate->value : $governorate;
        $query = ShippingZone::query()->where('is_active', true)->whereHas('governorates', fn ($query) => $query->where('governorate', $code));
        return ($lock ? $query->lockForUpdate() : $query)->first();
    }

    public function ratesFor(JordanGovernorate|string $governorate): Collection
    {
        $zone = $this->zoneFor($governorate);
        if (! $zone) return new Collection();
        return ShippingMethodZoneRate::query()->with(['method', 'zone'])->where('shipping_zone_id', $zone->id)->where('is_active', true)
            ->whereHas('method', fn ($query) => $query->where('is_active', true))->orderByDesc('is_default')
            ->orderBy(\App\Models\ShippingMethod::select('sort_order')->whereColumn('shipping_methods.id', 'shipping_method_zone_rates.shipping_method_id'))
            ->orderBy('id')->get();
    }

    public function rateFor(JordanGovernorate|string $governorate, int $methodId, bool $lock = false): ?ShippingMethodZoneRate
    {
        $zone = $this->zoneFor($governorate, $lock);
        if (! $zone) return null;
        $query = ShippingMethodZoneRate::query()->with(['method', 'zone'])->where('shipping_zone_id', $zone->id)->where('shipping_method_id', $methodId)
            ->where('is_active', true)->whereHas('method', fn ($query) => $query->where('is_active', true));
        return ($lock ? $query->lockForUpdate() : $query)->first();
    }
}
