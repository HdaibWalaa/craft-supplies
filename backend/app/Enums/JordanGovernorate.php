<?php

namespace App\Enums;

enum JordanGovernorate: string
{
    case Amman = 'amman';
    case Irbid = 'irbid';
    case Zarqa = 'zarqa';
    case Balqa = 'balqa';
    case Mafraq = 'mafraq';
    case Jerash = 'jerash';
    case Ajloun = 'ajloun';
    case Madaba = 'madaba';
    case Karak = 'karak';
    case Tafilah = 'tafilah';
    case Maan = 'maan';
    case Aqaba = 'aqaba';

    public function label(?string $locale = null): string
    {
        $arabic = match ($this) {
            self::Amman => 'عمّان', self::Irbid => 'إربد', self::Zarqa => 'الزرقاء',
            self::Balqa => 'البلقاء', self::Mafraq => 'المفرق', self::Jerash => 'جرش',
            self::Ajloun => 'عجلون', self::Madaba => 'مادبا', self::Karak => 'الكرك',
            self::Tafilah => 'الطفيلة', self::Maan => 'معان', self::Aqaba => 'العقبة',
        };

        return ($locale ?? app()->getLocale()) === 'ar' ? $arabic : match ($this) {
            self::Amman => 'Amman', self::Irbid => 'Irbid', self::Zarqa => 'Zarqa',
            self::Balqa => 'Balqa', self::Mafraq => 'Mafraq', self::Jerash => 'Jerash',
            self::Ajloun => 'Ajloun', self::Madaba => 'Madaba', self::Karak => 'Karak',
            self::Tafilah => 'Tafilah', self::Maan => "Ma'an", self::Aqaba => 'Aqaba',
        };
    }

    public static function options(?string $locale = null): array
    {
        return collect(self::cases())->mapWithKeys(fn (self $case) => [$case->value => $case->label($locale)])->all();
    }
}
