<?php
namespace App\Filament\Resources\ShippingZones\Schemas;
use App\Enums\JordanGovernorate;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;
class ShippingZoneForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Tabs::make('Translations')->tabs([
                Tab::make('English')->schema([TextInput::make('name.en')->required()]),
                Tab::make('العربية')->schema([TextInput::make('name.ar')->required()]),
            ])->columnSpanFull(),
            TextInput::make('slug')->required()->unique(ignoreRecord: true), Toggle::make('is_active')->default(true),
            TextInput::make('sort_order')->integer()->default(0)->required(),
            Repeater::make('governorates')->relationship()->schema([
                Select::make('governorate')->options(JordanGovernorate::options('ar'))->required()->disableOptionsWhenSelectedInSiblingRepeaterItems(),
            ])->minItems(1)->columnSpanFull(),
        ])->columns(2);
    }
}
