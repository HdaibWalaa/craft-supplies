<?php

namespace App\Filament\Resources\ShippingMethods\Schemas;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class ShippingMethodForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Tabs::make('Translations')->tabs([
                Tab::make('English')->schema([TextInput::make('name.en')->required(), Textarea::make('description.en')]),
                Tab::make('العربية')->schema([TextInput::make('name.ar')->required(), Textarea::make('description.ar')]),
            ])->columnSpanFull(),
            TextInput::make('sort_order')->integer()->default(0)->required(),
            Toggle::make('is_active')->default(true),
            Repeater::make('zoneRates')->relationship()->schema([
                Select::make('shipping_zone_id')->relationship('zone', 'slug')->required()->disableOptionsWhenSelectedInSiblingRepeaterItems(),
                TextInput::make('price')->numeric()->minValue(0)->prefix('JOD')->required(),
                TextInput::make('estimated_days_min')->integer()->minValue(0)->required(),
                TextInput::make('estimated_days_max')->integer()->minValue(0)->gte('estimated_days_min')->required(),
                Toggle::make('is_active')->default(true), Toggle::make('is_default')->default(false),
            ])->columns(3)->columnSpanFull(),
        ])->columns(2);
    }
}
