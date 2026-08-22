<?php

namespace App\Filament\Pages;

use App\Models\AboutPage;
use BackedEnum;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Contracts\Support\Htmlable;

class AboutPageSettings extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedInformationCircle;

    protected static ?int $navigationSort = 90;

    protected string $view = 'filament.pages.about-page-settings';

    public ?array $data = [];

    public ?int $aboutPageId = null;

    public static function getNavigationLabel(): string
    {
        return __('filament.about.navigation');
    }

    public static function getNavigationGroup(): ?string
    {
        return __('filament.about.navigation_group');
    }

    public function getTitle(): string|Htmlable
    {
        return __('filament.about.title');
    }

    public function mount(): void
    {
        $about = AboutPage::singleton();
        $this->aboutPageId = $about->getKey();
        $state = [];

        foreach ($about->translatable as $field) {
            $state[$field] = $about->getTranslations($field);
        }

        $this->form->model($about)->fill($state);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make(__('filament.about.translations'))
                    ->tabs([
                        $this->translationTab(__('filament.locale.english'), 'en'),
                        $this->translationTab(__('filament.locale.arabic'), 'ar'),
                    ])
                    ->columnSpanFull(),
            ])
            ->model(fn (): AboutPage => AboutPage::query()->findOrFail($this->aboutPageId))
            ->statePath('data');
    }

    public function save(): void
    {
        AboutPage::query()->findOrFail($this->aboutPageId)->update($this->form->getState());

        Notification::make()
            ->success()
            ->title(__('filament.about.saved'))
            ->send();
    }

    private function translationTab(string $label, string $locale): Tab
    {
        return Tab::make($label)->schema([
            Section::make(__('filament.about.main_content'))->schema([
                TextInput::make("title.{$locale}")
                    ->label(__('filament.about.fields.title'))
                    ->required()
                    ->maxLength(255),
                Textarea::make("paragraph_1.{$locale}")
                    ->label(__('filament.about.fields.paragraph_1'))
                    ->required()
                    ->rows(6)
                    ->maxLength(3000),
                Textarea::make("paragraph_2.{$locale}")
                    ->label(__('filament.about.fields.paragraph_2'))
                    ->required()
                    ->rows(6)
                    ->maxLength(3000),
            ]),
            $this->featureSection(1, $locale),
            $this->featureSection(2, $locale),
            $this->featureSection(3, $locale),
        ]);
    }

    private function featureSection(int $feature, string $locale): Section
    {
        return Section::make(__("filament.about.feature_{$feature}"))->schema([
            TextInput::make("feature_{$feature}_title.{$locale}")
                ->label(__('filament.about.fields.title'))
                ->required()
                ->maxLength(255),
            Textarea::make("feature_{$feature}_description.{$locale}")
                ->label(__('filament.about.fields.description'))
                ->required()
                ->rows(3)
                ->maxLength(1000),
        ])->columns(2);
    }
}
