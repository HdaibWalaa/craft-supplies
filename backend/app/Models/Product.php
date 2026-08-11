<?php

namespace App\Models;

use App\Enums\ProductStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Translatable\HasTranslations;

class Product extends Model implements HasMedia
{
    use HasFactory, HasTranslations, InteractsWithMedia, SoftDeletes;

    protected $fillable = ['category_id', 'name', 'slug', 'sku', 'short_description', 'description', 'specifications', 'safety_warnings', 'usage_notes', 'meta_title', 'meta_description', 'base_price', 'sale_price', 'compare_at_price', 'status', 'is_visible', 'is_featured', 'is_new_arrival', 'is_bundle', 'rating', 'review_count'];

    public array $translatable = ['name', 'short_description', 'description', 'specifications', 'safety_warnings', 'usage_notes', 'meta_title', 'meta_description'];

    protected function casts(): array
    {
        return [
            'status' => ProductStatus::class,
            'base_price' => 'decimal:2', 'sale_price' => 'decimal:2', 'compare_at_price' => 'decimal:2', 'rating' => 'decimal:2',
            'is_visible' => 'boolean', 'is_featured' => 'boolean', 'is_new_arrival' => 'boolean', 'is_bundle' => 'boolean',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class)->orderBy('sort_order');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function attributeValues()
    {
        return $this->hasMany(ProductAttributeValue::class);
    }

    public function relatedProducts()
    {
        return $this->belongsToMany(self::class, 'product_relations', 'product_id', 'related_product_id')->withPivot(['type', 'sort_order']);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('product_images')->useDisk(config('media-library.disk_name'));
        $this->addMediaCollection('thumbnail')->singleFile()->useDisk(config('media-library.disk_name'));
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')->fit(Fit::Crop, 320, 320)->nonQueued();
        $this->addMediaConversion('medium')->width(800)->height(800)->nonQueued();
        $this->addMediaConversion('large')->width(1600)->height(1600)->queued();
    }
}
