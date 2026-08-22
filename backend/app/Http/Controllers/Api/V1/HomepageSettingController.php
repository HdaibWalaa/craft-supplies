<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Enums\WebsiteTheme;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;

class HomepageSettingController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $settings = SiteSetting::query()->first();
        $heroTwo = $settings?->values['hero_2'] ?? [];
        $locale = app()->getLocale();
        $media = $settings?->getFirstMedia('hero_2_media');
        $poster = $settings?->getFirstMedia('hero_2_poster');

        return response()->json([
            'data' => [
                'appearance' => [
                    'theme' => $settings?->websiteTheme()->value ?? WebsiteTheme::Theme1->value,
                ],
                'hero_style' => $settings?->heroStyle()->value ?? 'hero_1',
                'contact' => $settings?->contactInformation($locale)
                    ?? SiteSetting::configuredContactInformation($locale),
                'hero_2' => [
                    'media' => $media ? [
                        'type' => $this->mediaType((string) $media->mime_type, (string) $media->file_name),
                        'url' => $media->getFullUrl(),
                        'poster_url' => $poster?->getFullUrl(),
                    ] : null,
                    'eyebrow' => $this->localized($heroTwo['eyebrow'] ?? [], $locale),
                    'title' => $this->localized($heroTwo['title'] ?? [], $locale),
                    'description' => $this->localized($heroTwo['description'] ?? [], $locale),
                    'primary_button' => [
                        'label' => $this->localized($heroTwo['primary_button_label'] ?? [], $locale),
                        'url' => $heroTwo['primary_button_url'] ?? null,
                    ],
                    'secondary_button' => [
                        'label' => $this->localized($heroTwo['secondary_button_label'] ?? [], $locale),
                        'url' => $heroTwo['secondary_button_url'] ?? null,
                    ],
                ],
            ],
        ]);
    }

    private function localized(mixed $translations, string $locale): ?string
    {
        if (! is_array($translations)) {
            return null;
        }

        $value = $translations[$locale] ?? null;

        return is_string($value) && $value !== '' ? $value : null;
    }

    private function mediaType(string $mimeType, string $fileName): string
    {
        if (str_starts_with($mimeType, 'video/')) {
            return 'video';
        }

        return in_array(strtolower(pathinfo($fileName, PATHINFO_EXTENSION)), ['mp4', 'webm'], true)
            ? 'video'
            : 'image';
    }
}
