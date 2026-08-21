<?php

namespace App\Filament\Resources\Orders\Schemas;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use App\Enums\JordanGovernorate;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('order_number')
                    ->required(),
                TextInput::make('user_id')
                    ->numeric(),
                TextInput::make('discount_code_id')
                    ->numeric(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email(),
                Select::make('status')
                    ->options(OrderStatus::class)
                    ->default('pending')
                    ->required(),
                Select::make('payment_status')
                    ->options(PaymentStatus::class)
                    ->default('pending')
                    ->required(),
                TextInput::make('payment_method')
                    ->required()
                    ->default('simulated'),
                TextInput::make('shipping_address.full_name')->label('Customer name')->disabled(),
                TextInput::make('shipping_address.phone')->label('Phone')->disabled(),
                TextInput::make('shipping_address.governorate')->label('Governorate')->formatStateUsing(fn (?string $state) => $state ? (JordanGovernorate::tryFrom($state)?->label('en') ?? $state) : null)->disabled(),
                Textarea::make('shipping_address.address')->label('Delivery address')->disabled()->columnSpanFull(),
                TextInput::make('shipping_method_name')->label('Shipping method')->disabled(),
                TextInput::make('shipping_zone_name')->label('Shipping zone')->disabled(),
                TextInput::make('shipping_total')->label('Shipping price')->prefix('JOD')->disabled(),
                TextInput::make('shipping_estimated_days_min')->label('Minimum delivery days')->disabled(),
                TextInput::make('shipping_estimated_days_max')->label('Maximum delivery days')->disabled(),
                TextInput::make('subtotal')
                    ->required()
                    ->numeric(),
                TextInput::make('discount_total')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('tax_total')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('total')
                    ->required()
                    ->numeric(),
                TextInput::make('currency')
                    ->required()
                    ->default('JOD'),
                DateTimePicker::make('paid_at'),
            ]);
    }
}
