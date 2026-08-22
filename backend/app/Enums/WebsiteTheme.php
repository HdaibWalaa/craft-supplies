<?php

namespace App\Enums;

enum WebsiteTheme: string
{
    case Theme1 = 'theme_1';

    public static function fallback(?string $value): self
    {
        return self::tryFrom((string) $value) ?? self::Theme1;
    }

    public static function options(): array
    {
        return [
            self::Theme1->value => __('filament.homepage.appearance.themes.theme_1'),
        ];
    }
}
