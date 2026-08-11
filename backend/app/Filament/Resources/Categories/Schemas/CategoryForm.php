<?php

namespace App\Filament\Resources\Categories\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('parent_id')->relationship('parent', 'slug')->searchable()->preload(),
            TextInput::make('slug')->required()->unique(ignoreRecord: true),
            Tabs::make('Translations')->tabs([
                self::translationTab('English', 'en'), self::translationTab('العربية', 'ar'),
            ])->columnSpanFull(),
            SpatieMediaLibraryFileUpload::make('category_image')->collection('category_image')->image()->maxSize(5120)->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp']),
            TextInput::make('color_theme')->default('terracotta')->required(),
            TextInput::make('sort_order')->integer()->default(0)->required(),
            Toggle::make('is_active')->default(true),
            Select::make('attributes')->relationship('attributes', 'slug')->multiple()->searchable()->preload()->columnSpanFull(),
        ])->columns(2);
    }

    private static function translationTab(string $label, string $locale): Tab
    {
        return Tab::make($label)->schema([
            TextInput::make("name.{$locale}")->required(), Textarea::make("description.{$locale}"),
            TextInput::make("meta_title.{$locale}"), Textarea::make("meta_description.{$locale}"),
        ])->columns(2);
    }
}
