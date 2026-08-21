<?php

namespace Tests\Feature;

use App\Enums\JordanGovernorate;
use App\Models\ShippingMethod;
use App\Models\ShippingZone;
use App\Services\ShippingRateResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShippingZoneApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_twelve_governorates_resolve_to_the_configured_zone(): void
    {
        $resolver = app(ShippingRateResolver::class);
        foreach (JordanGovernorate::cases() as $governorate) {
            $expected = $governorate === JordanGovernorate::Amman ? 'amman' : 'outside-amman';
            $this->assertSame($expected, $resolver->zoneFor($governorate)?->slug, $governorate->value);
        }
    }

    public function test_governorates_receive_their_zone_specific_rates(): void
    {
        ShippingMethod::query()->delete();
        $method = $this->methodWithRates(3, 5);
        $this->getJson('/api/v1/shipping-methods?governorate=amman')->assertOk()->assertJsonPath('data.0.price', 3)->assertJsonPath('data.0.zone.slug', 'amman');
        $this->getJson('/api/v1/shipping-methods?governorate=irbid')->assertOk()->assertJsonPath('data.0.price', 5)->assertJsonPath('data.0.zone.slug', 'outside-amman');
        $this->getJson('/api/v1/shipping-methods?governorate=aqaba')->assertOk()->assertJsonPath('data.0.price', 5);
        $this->assertNotNull($method);
    }

    public function test_inactive_zone_method_and_rate_are_excluded(): void
    {
        ShippingMethod::query()->delete();
        $method = $this->methodWithRates(3, 5);
        ShippingZone::query()->where('slug', 'amman')->update(['is_active' => false]);
        $this->getJson('/api/v1/shipping-methods?governorate=amman')->assertOk()->assertJsonCount(0, 'data');
        ShippingZone::query()->where('slug', 'amman')->update(['is_active' => true]);
        $method->update(['is_active' => false]);
        $this->getJson('/api/v1/shipping-methods?governorate=amman')->assertOk()->assertJsonCount(0, 'data');
        $method->update(['is_active' => true]);
        $method->zoneRates()->whereHas('zone', fn ($query) => $query->where('slug', 'amman'))->update(['is_active' => false]);
        $this->getJson('/api/v1/shipping-methods?governorate=amman')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_invalid_or_missing_governorate_is_rejected(): void
    {
        $this->getJson('/api/v1/shipping-methods?governorate=invalid')->assertUnprocessable()->assertJsonValidationErrors('governorate');
        $this->getJson('/api/v1/shipping-methods')->assertUnprocessable()->assertJsonValidationErrors('governorate');
    }

    public function test_arabic_and_english_method_and_zone_names_are_localized(): void
    {
        ShippingMethod::query()->delete();
        $this->methodWithRates(3, 5);
        $this->withHeader('Accept-Language', 'ar')->getJson('/api/v1/shipping-methods?governorate=amman')->assertJsonPath('data.0.name', 'التوصيل')->assertJsonPath('data.0.zone.name', 'عمّان');
        $this->withHeader('Accept-Language', 'en')->getJson('/api/v1/shipping-methods?governorate=amman')->assertJsonPath('data.0.name', 'Delivery')->assertJsonPath('data.0.zone.name', 'Amman');
    }

    private function methodWithRates(float $amman, float $outside): ShippingMethod
    {
        $method = ShippingMethod::query()->create(['name' => ['ar' => 'التوصيل', 'en' => 'Delivery'], 'description' => ['ar' => 'وصف', 'en' => 'Description'], 'price' => $amman, 'estimated_days_min' => 1, 'estimated_days_max' => 5, 'is_active' => true, 'sort_order' => 1]);
        foreach (ShippingZone::query()->get() as $zone) $method->zoneRates()->create(['shipping_zone_id' => $zone->id, 'price' => $zone->slug === 'amman' ? $amman : $outside, 'estimated_days_min' => $zone->slug === 'amman' ? 1 : 2, 'estimated_days_max' => $zone->slug === 'amman' ? 3 : 5, 'is_active' => true, 'is_default' => true]);
        return $method;
    }
}
