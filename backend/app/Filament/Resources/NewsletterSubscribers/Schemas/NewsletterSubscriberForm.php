<?php

namespace App\Filament\Resources\NewsletterSubscribers\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class NewsletterSubscriberForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                TextInput::make('status')
                    ->required()
                    ->default('subscribed'),
                TextInput::make('locale')
                    ->required()
                    ->default('en'),
                DateTimePicker::make('subscribed_at')
                    ->required(),
                DateTimePicker::make('unsubscribed_at'),
            ]);
    }
}
