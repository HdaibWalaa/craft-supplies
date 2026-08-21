<?php
namespace App\Filament\Resources\ShippingZones\Tables;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
class ShippingZonesTable
{
    public static function configure(Table $table): Table { return $table->defaultSort('sort_order')->columns([
        TextColumn::make('name')->searchable(), TextColumn::make('slug')->searchable(), TextColumn::make('governorates_count')->counts('governorates')->label('Governorates'), IconColumn::make('is_active')->boolean(), TextColumn::make('sort_order')->sortable(),
    ])->recordActions([EditAction::make()]); }
}
