<?php

namespace App\Filament\Resources\BlogPosts\Pages;

use App\Filament\Resources\BlogPosts\BlogPostResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListBlogPosts extends ListRecords
{
    protected static string $resource = BlogPostResource::class;

    public function getSubheading(): ?string
    {
        return __('filament.tutorials.description');
    }

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
