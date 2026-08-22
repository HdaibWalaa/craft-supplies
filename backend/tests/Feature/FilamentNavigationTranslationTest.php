<?php

namespace Tests\Feature;

use App\Filament\Resources\BlogPosts\BlogPostResource;
use App\Filament\Resources\Categories\CategoryResource;
use App\Filament\Resources\DiscountCodes\DiscountCodeResource;
use App\Filament\Resources\NewsletterSubscribers\NewsletterSubscriberResource;
use App\Filament\Resources\Orders\OrderResource;
use App\Filament\Resources\Products\ProductResource;
use App\Filament\Resources\ShippingMethods\ShippingMethodResource;
use App\Filament\Resources\ShippingZones\ShippingZoneResource;
use App\Filament\Resources\Users\UserResource;
use Tests\TestCase;

class FilamentNavigationTranslationTest extends TestCase
{
    public function test_all_resource_navigation_labels_follow_the_application_locale(): void
    {
        $resources = [
            BlogPostResource::class => ['Tutorials & Inspiration', 'أفكار وشروحات'],
            CategoryResource::class => ['Categories', 'التصنيفات'],
            DiscountCodeResource::class => ['Discount Codes', 'أكواد الخصم'],
            NewsletterSubscriberResource::class => ['Newsletter Subscribers', 'مشتركو النشرة البريدية'],
            OrderResource::class => ['Orders', 'الطلبات'],
            ProductResource::class => ['Products', 'المنتجات'],
            ShippingMethodResource::class => ['Shipping Methods', 'طرق الشحن'],
            ShippingZoneResource::class => ['Shipping Zones', 'مناطق الشحن'],
            UserResource::class => ['Users', 'المستخدمون'],
        ];

        foreach ($resources as $resource => [$english, $arabic]) {
            app()->setLocale('en');
            $this->assertSame($english, $resource::getNavigationLabel());

            app()->setLocale('ar');
            $this->assertSame($arabic, $resource::getNavigationLabel());
        }
    }

    public function test_admin_locale_is_selected_by_query_string_and_persisted_in_the_session(): void
    {
        $this->get('/admin?locale=en')->assertSessionHas('filament_locale', 'en');
        $this->get('/admin?locale=ar')->assertSessionHas('filament_locale', 'ar');
    }

    public function test_filament_uses_rtl_direction_for_arabic(): void
    {
        $this->assertSame('rtl', __('filament-panels::layout.direction', locale: 'ar'));
        $this->assertSame('ltr', __('filament-panels::layout.direction', locale: 'en'));
    }
}
