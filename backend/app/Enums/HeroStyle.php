<?php

namespace App\Enums;

enum HeroStyle: string
{
    case Hero1 = 'hero_1';
    case Hero2 = 'hero_2';

    public static function fallback(?string $value): self
    {
        return self::tryFrom((string) $value) ?? self::Hero1;
    }

    public static function options(): array
    {
        return [
            self::Hero1->value => __('filament.homepage.hero_styles.hero_1'),
            self::Hero2->value => __('filament.homepage.hero_styles.hero_2'),
        ];
    }
}
