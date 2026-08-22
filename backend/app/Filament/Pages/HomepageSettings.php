<?php

namespace App\Filament\Pages;

use App\Enums\HeroStyle;
use App\Enums\WebsiteTheme;
use App\Models\SiteSetting;
use BackedEnum;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Contracts\Support\Htmlable;

class HomepageSettings extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPhoto;

    protected static ?int $navigationSort = 100;

    protected string $view = 'filament.pages.homepage-settings';

    public ?array $data = [];

    public ?int $settingsId = null;

    public static function getNavigationLabel(): string
    {
        return __('filament.homepage.navigation');
    }

    public function getTitle(): string|Htmlable
    {
        return __('filament.homepage.title');
    }

    public function mount(): void
    {
        $settings = SiteSetting::query()->firstOrCreate([], ['values' => []]);
        $this->settingsId = $settings->getKey();

        $this->form->model($settings)->fill([
            'appearance' => [
                'theme' => $settings->websiteTheme()->value,
            ],
            'hero_style' => $settings->heroStyle()->value,
            'hero_2' => $settings->values['hero_2'] ?? [],
            'contact' => array_replace_recursive(
                SiteSetting::defaultContactInformation(),
                is_array($settings->values['contact'] ?? null) ? $settings->values['contact'] : [],
            ),
        ]);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make(__('filament.homepage.appearance.section'))
                    ->description(__('filament.homepage.appearance.description'))
                    ->schema([
                        Select::make('appearance.theme')
                            ->label(__('filament.homepage.appearance.website_theme'))
                            ->options(WebsiteTheme::options())
                            ->required()
                            ->native(false),
                    ]),
                Section::make(__('filament.homepage.hero_section'))
                    ->schema([
                        Select::make('hero_style')
                            ->label(__('filament.homepage.hero_style'))
                            ->options(HeroStyle::options())
                            ->required()
                            ->live()
                            ->native(false),
                    ]),
                Section::make(__('filament.homepage.hero_2.section'))
                    ->description(__('filament.homepage.hero_2.description'))
                    ->visible(fn (Get $get): bool => $get('hero_style') === HeroStyle::Hero2->value)
                    ->schema([
                        SpatieMediaLibraryFileUpload::make('hero_2_media')
                            ->label(__('filament.homepage.hero_2.media'))
                            ->helperText(__('filament.homepage.hero_2.media_help'))
                            ->collection('hero_2_media')
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'])
                            ->maxSize(10240)
                            ->openable()
                            ->downloadable()
                            ->columnSpanFull(),
                        SpatieMediaLibraryFileUpload::make('hero_2_poster')
                            ->label(__('filament.homepage.hero_2.poster'))
                            ->helperText(__('filament.homepage.hero_2.poster_help'))
                            ->collection('hero_2_poster')
                            ->image()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->maxSize(5120)
                            ->columnSpanFull(),
                        Tabs::make(__('filament.homepage.hero_2.content'))
                            ->tabs([
                                $this->heroTwoTranslationTab(__('filament.locale.english'), 'en'),
                                $this->heroTwoTranslationTab(__('filament.locale.arabic'), 'ar'),
                            ])
                            ->columnSpanFull(),
                        TextInput::make('hero_2.primary_button_url')
                            ->label(__('filament.homepage.hero_2.primary_button_url'))
                            ->maxLength(2048),
                        TextInput::make('hero_2.secondary_button_url')
                            ->label(__('filament.homepage.hero_2.secondary_button_url'))
                            ->maxLength(2048),
                    ])
                    ->columns(2),
                Section::make(__('filament.homepage.contact.section'))
                    ->description(__('filament.homepage.contact.description'))
                    ->schema([
                        TextInput::make('contact.email')
                            ->label(__('filament.homepage.contact.email'))
                            ->email()
                            ->required(),
                        TextInput::make('contact.support_hours')
                            ->label(__('filament.homepage.contact.support_hours'))
                            ->required(),
                        TextInput::make('contact.address.en')
                            ->label(__('filament.homepage.contact.address_en'))
                            ->required(),
                        TextInput::make('contact.address.ar')
                            ->label(__('filament.homepage.contact.address_ar'))
                            ->required(),
                        TextInput::make('contact.whatsapp_display')
                            ->label(__('filament.homepage.contact.whatsapp_display'))
                            ->required(),
                        TextInput::make('contact.whatsapp_number')
                            ->label(__('filament.homepage.contact.whatsapp_number'))
                            ->helperText(__('filament.homepage.contact.whatsapp_help'))
                            ->regex('/^[1-9][0-9]+$/')
                            ->required(),
                        TextInput::make('contact.instagram_url')
                            ->label(__('filament.homepage.contact.instagram'))
                            ->url()
                            ->required(),
                        TextInput::make('contact.facebook_url')
                            ->label(__('filament.homepage.contact.facebook'))
                            ->url()
                            ->required(),
                    ])
                    ->columns(2),
            ])
            ->model(fn (): SiteSetting => SiteSetting::query()->findOrFail($this->settingsId))
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();
        $settings = SiteSetting::query()->findOrFail($this->settingsId);
        $values = $settings->values ?? [];
        $values['appearance'] = is_array($values['appearance'] ?? null) ? $values['appearance'] : [];
        $values['appearance']['theme'] = WebsiteTheme::fallback($data['appearance']['theme'] ?? null)->value;
        $values['hero_style'] = HeroStyle::fallback($data['hero_style'] ?? null)->value;
        $values['hero_2'] = $data['hero_2'] ?? ($values['hero_2'] ?? []);
        $values['contact'] = $data['contact'] ?? ($values['contact'] ?? SiteSetting::defaultContactInformation());
        $settings->update(['values' => $values]);
        $this->form->model($settings)->saveRelationships();

        Notification::make()
            ->success()
            ->title(__('filament.homepage.saved'))
            ->send();
    }

    private function heroTwoTranslationTab(string $label, string $locale): Tab
    {
        return Tab::make($label)->schema([
            TextInput::make("hero_2.eyebrow.{$locale}")
                ->label(__('filament.homepage.hero_2.eyebrow'))
                ->maxLength(160),
            TextInput::make("hero_2.title.{$locale}")
                ->label(__('filament.homepage.hero_2.title'))
                ->maxLength(255),
            Textarea::make("hero_2.description.{$locale}")
                ->label(__('filament.homepage.hero_2.body'))
                ->rows(3)
                ->maxLength(600),
            TextInput::make("hero_2.primary_button_label.{$locale}")
                ->label(__('filament.homepage.hero_2.primary_button_label'))
                ->maxLength(100),
            TextInput::make("hero_2.secondary_button_label.{$locale}")
                ->label(__('filament.homepage.hero_2.secondary_button_label'))
                ->maxLength(100),
        ])->columns(2);
    }
}
