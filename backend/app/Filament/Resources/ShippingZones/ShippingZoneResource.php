<?php

namespace App\Filament\Resources\ShippingZones;

use App\Filament\Resources\ShippingZones\Pages\CreateShippingZone;
use App\Filament\Resources\ShippingZones\Pages\EditShippingZone;
use App\Filament\Resources\ShippingZones\Pages\ListShippingZones;
use App\Filament\Resources\ShippingZones\Schemas\ShippingZoneForm;
use App\Filament\Resources\ShippingZones\Tables\ShippingZonesTable;
use App\Models\ShippingZone;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ShippingZoneResource extends Resource
{
    protected static ?string $model = ShippingZone::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedMap;

    public static function getNavigationLabel(): string
    {
        return __('filament.navigation.shipping_zones');
    }

    public static function getModelLabel(): string
    {
        return __('filament.models.shipping_zone');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament.models.shipping_zones');
    }

    public static function form(Schema $schema): Schema
    {
        return ShippingZoneForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ShippingZonesTable::configure($table);
    }

    public static function getPages(): array
    {
        return ['index' => ListShippingZones::route('/'), 'create' => CreateShippingZone::route('/create'), 'edit' => EditShippingZone::route('/{record}/edit')];
    }
}
