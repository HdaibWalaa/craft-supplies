<?php

namespace App\Filament\Resources\Orders\Schemas;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

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
                    ->email()
                    ->required(),
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
                TextInput::make('shipping_method')
                    ->required()
                    ->default('standard'),
                Textarea::make('shipping_address')
                    ->required()
                    ->columnSpanFull(),
                Textarea::make('billing_address')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('subtotal')
                    ->required()
                    ->numeric(),
                TextInput::make('discount_total')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('shipping_total')
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
                    ->default('USD'),
                DateTimePicker::make('paid_at'),
            ]);
    }
}
