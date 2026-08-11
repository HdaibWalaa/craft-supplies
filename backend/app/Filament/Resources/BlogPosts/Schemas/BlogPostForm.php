<?php

namespace App\Filament\Resources\BlogPosts\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class BlogPostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('slug')->required()->unique(ignoreRecord: true),
            Select::make('status')->options(['draft' => 'Draft', 'published' => 'Published'])->default('draft')->required(),
            DateTimePicker::make('published_at'),
            SpatieMediaLibraryFileUpload::make('featured_image')->collection('featured_image')->image()->maxSize(5120),
            Tabs::make('Translations')->tabs([self::translationTab('English', 'en'), self::translationTab('العربية', 'ar')])->columnSpanFull(),
            Select::make('products')->relationship('products', 'slug')->multiple()->searchable()->preload()->columnSpanFull(),
        ])->columns(2);
    }

    private static function translationTab(string $label, string $locale): Tab
    {
        return Tab::make($label)->schema([
            TextInput::make("title.{$locale}")->required(), Textarea::make("excerpt.{$locale}")->required(),
            RichEditor::make("content.{$locale}")->required()->columnSpanFull(), TextInput::make("meta_title.{$locale}"),
            Textarea::make("meta_description.{$locale}"),
        ])->columns(2);
    }
}
