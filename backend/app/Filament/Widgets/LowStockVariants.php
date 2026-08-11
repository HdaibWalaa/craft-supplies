<?php

namespace App\Filament\Widgets;

use App\Models\ProductVariant;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\TextInputColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use Illuminate\Database\Eloquent\Builder;

class LowStockVariants extends TableWidget
{
    public function table(Table $table): Table
    {
        return $table
            ->query(fn (): Builder => ProductVariant::query()->with('product')->whereColumn('stock', '<=', 'low_stock_threshold')->orderBy('stock'))
            ->columns([
                TextColumn::make('product.name')->label('Product')->searchable(),
                TextColumn::make('name')->label('Variant'),
                TextColumn::make('sku')->label('SKU')->searchable(),
                TextColumn::make('stock')->badge()->color(fn (int $state) => $state === 0 ? 'danger' : 'warning'),
                TextInputColumn::make('low_stock_threshold')->type('number')->rules(['required', 'integer', 'min:0']),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                //
            ])
            ->recordActions([
                //
            ])
            ->paginated([10, 25]);
    }
}
