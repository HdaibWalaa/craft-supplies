<?php

namespace App\Models;

use App\Enums\HeroStyle;
use App\Enums\WebsiteTheme;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class SiteSetting extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = ['hero_product_id', 'values'];

    protected function casts(): array
    {
        return ['values' => 'array'];
    }

    public function heroStyle(): HeroStyle
    {
        return HeroStyle::fallback($this->values['hero_style'] ?? null);
    }

    public static function configuredHeroStyle(): HeroStyle
    {
        return self::query()->first()?->heroStyle() ?? HeroStyle::Hero1;
    }

    public function websiteTheme(): WebsiteTheme
    {
        return WebsiteTheme::fallback($this->values['appearance']['theme'] ?? null);
    }

    public static function configuredWebsiteTheme(): WebsiteTheme
    {
        return self::query()->first()?->websiteTheme() ?? WebsiteTheme::Theme1;
    }

    public static function defaultContactInformation(): array
    {
        return [
            'email' => 'info@craftsuppliesjo.com',
            'address' => ['en' => 'Amman - Jordan', 'ar' => 'عمّان - الأردن'],
            'support_hours' => '24/7',
            'whatsapp_display' => '00962790283438',
            'whatsapp_number' => '962790283438',
            'instagram_url' => 'https://www.instagram.com/craft_supplies.jo/',
            'facebook_url' => 'https://web.facebook.com/profile.php?id=61591919013692',
        ];
    }

    public function contactInformation(?string $locale = null): array
    {
        $contact = array_replace_recursive(
            self::defaultContactInformation(),
            is_array($this->values['contact'] ?? null) ? $this->values['contact'] : [],
        );
        $locale ??= app()->getLocale();

        return [
            'email' => $contact['email'],
            'address' => $contact['address'][$locale] ?? $contact['address']['en'],
            'support_hours' => $contact['support_hours'],
            'whatsapp_display' => $contact['whatsapp_display'],
            'whatsapp_url' => 'https://wa.me/'.$contact['whatsapp_number'],
            'instagram_url' => $contact['instagram_url'],
            'facebook_url' => $contact['facebook_url'],
        ];
    }

    public static function configuredContactInformation(?string $locale = null): array
    {
        return self::query()->first()?->contactInformation($locale)
            ?? (new self(['values' => []]))->contactInformation($locale);
    }

    public function registerMediaCollections(): void
    {
        $disk = config('media-library.disk_name');

        $this->addMediaCollection('hero_2_media')->singleFile()->useDisk($disk);
        $this->addMediaCollection('hero_2_poster')->singleFile()->useDisk($disk);
    }
}
