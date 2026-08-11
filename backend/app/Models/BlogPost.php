<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Translatable\HasTranslations;

class BlogPost extends Model implements HasMedia
{
    use HasTranslations, InteractsWithMedia, SoftDeletes;

    protected $fillable = ['title', 'slug', 'excerpt', 'content', 'meta_title', 'meta_description', 'status', 'published_at'];

    public array $translatable = ['title', 'excerpt', 'content', 'meta_title', 'meta_description'];

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }

    public function products()
    {
        return $this->belongsToMany(Product::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('featured_image')->singleFile();
        $this->addMediaCollection('content_images');
    }
}
