<?php

namespace App\Filament\Resources\Products\Schemas;

use App\Enums\ProductStatus;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('category_id')->relationship('category', 'slug')->searchable()->preload()->required(),
            TextInput::make('slug')->required()->unique(ignoreRecord: true),
            TextInput::make('sku')->label('Base SKU')->unique(ignoreRecord: true),
            Tabs::make('Translations')->columnSpanFull()->tabs([
                self::translationTab('English', 'en'),
                self::translationTab('العربية', 'ar'),
            ]),
            TextInput::make('base_price')->required()->numeric()->prefix('$'),
            TextInput::make('sale_price')->numeric()->prefix('$'),
            TextInput::make('compare_at_price')->numeric()->prefix('$'),
            Select::make('status')->options(ProductStatus::class)->default(ProductStatus::Active)->required(),
            Toggle::make('is_visible')->default(true),
            Toggle::make('is_featured'), Toggle::make('is_new_arrival'), Toggle::make('is_bundle'),
            SpatieMediaLibraryFileUpload::make('product_images')
                ->label('Product images')
                ->collection('product_images')
                ->image()
                ->multiple()
                ->reorderable()
                ->panelLayout('grid')
                ->responsiveImages()
                ->maxSize(5120)
                ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                ->columnSpanFull(),
            SpatieMediaLibraryFileUpload::make('thumbnail')->collection('thumbnail')->image()->maxSize(5120),
            Repeater::make('variants')->relationship()->schema([
                TextInput::make('name.en')->label('Name (English)')->required(),
                TextInput::make('name.ar')->label('Name (Arabic)')->required(),
                TextInput::make('sku')->required()->unique(ignoreRecord: true),
                TextInput::make('price')->numeric()->required()->prefix('$'),
                TextInput::make('sale_price')->numeric()->prefix('$'),
                TextInput::make('stock')->integer()->minValue(0)->required(),
                TextInput::make('low_stock_threshold')->integer()->minValue(0)->default(5)->required(),
                Toggle::make('is_active')->default(true),
            ])->columns(4)->orderColumn('sort_order')->columnSpanFull(),
            Repeater::make('attributeValues')->relationship()->schema([
                Select::make('attribute_id')->relationship('attribute', 'slug')->required()->preload(),
                Select::make('attribute_value_id')->relationship('option', 'slug')->searchable()->preload(),
                TextInput::make('value.en')->label('Custom value (English)'),
                TextInput::make('value.ar')->label('Custom value (Arabic)'),
            ])->columns(2)->columnSpanFull(),
        ])->columns(2);
    }

    private static function translationTab(string $label, string $locale): Tab
    {
        return Tab::make($label)->schema([
            TextInput::make("name.{$locale}")->required(),
            Textarea::make("short_description.{$locale}")->required(),
            Textarea::make("description.{$locale}")->required()->rows(6),
            Textarea::make("safety_warnings.{$locale}"),
            Textarea::make("usage_notes.{$locale}"),
            KeyValue::make("specifications.{$locale}")->columnSpanFull(),
            TextInput::make("meta_title.{$locale}"),
            Textarea::make("meta_description.{$locale}"),
        ])->columns(2);
    }
}
