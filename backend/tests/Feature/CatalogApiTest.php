<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CatalogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_returns_paginated_compatible_product_shape(): void
    {
        $category = Category::query()->create(['name' => ['en' => 'Candles', 'ar' => 'الشموع'], 'slug' => 'candles', 'is_active' => true]);
        $product = Product::query()->create([
            'category_id' => $category->id, 'name' => ['en' => 'Soy Wax', 'ar' => 'شمع الصويا'], 'slug' => 'soy-wax',
            'short_description' => ['en' => 'Clean wax', 'ar' => 'شمع نظيف'], 'description' => ['en' => 'Description', 'ar' => 'الوصف'],
            'base_price' => 12.50, 'status' => 'active', 'is_visible' => true,
        ]);
        $product->variants()->create(['name' => ['en' => '1 kg', 'ar' => '١ كغم'], 'sku' => 'WAX-1KG', 'price' => 12.50, 'stock' => 4]);

        $this->getJson('/api/v1/products')->assertOk()
            ->assertJsonPath('data.0.name', 'Soy Wax')->assertJsonPath('data.0.basePrice', 12.5)
            ->assertJsonPath('data.0.variants.0.lowStockAt', 5)->assertJsonStructure(['data', 'links', 'meta']);
    }

    public function test_accept_language_selects_arabic_translation(): void
    {
        Category::query()->create(['name' => ['en' => 'Candles', 'ar' => 'الشموع'], 'slug' => 'candles', 'is_active' => true]);
        $this->withHeader('Accept-Language', 'ar')->getJson('/api/v1/categories')->assertOk()->assertJsonPath('data.0.name', 'الشموع');
    }

    public function test_product_details_localize_all_customer_facing_catalog_fields(): void
    {
        $category = Category::query()->create([
            'name' => ['en' => 'Candles', 'ar' => 'الشموع'],
            'slug' => 'candles-localized',
            'is_active' => true,
        ]);
        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => ['en' => 'Soy Wax', 'ar' => 'شمع الصويا'],
            'slug' => 'localized-soy-wax',
            'short_description' => ['en' => 'Clean wax', 'ar' => 'شمع نظيف'],
            'description' => ['en' => 'English description', 'ar' => 'وصف عربي'],
            'specifications' => [
                'en' => ['Material' => 'Soy wax'],
                'ar' => ['الخامة' => 'شمع الصويا'],
            ],
            'usage_notes' => ['en' => 'Use carefully', 'ar' => 'يستخدم بعناية'],
            'safety_warnings' => ['en' => 'Keep away from heat', 'ar' => 'يحفظ بعيداً عن الحرارة'],
            'meta_title' => ['en' => 'Soy Wax SEO', 'ar' => 'شمع الصويا للشموع'],
            'meta_description' => ['en' => 'English SEO description', 'ar' => 'وصف عربي لمحركات البحث'],
            'base_price' => 12.50,
            'status' => 'active',
            'is_visible' => true,
        ]);
        $product->variants()->create([
            'name' => ['en' => 'Large', 'ar' => 'كبير'],
            'sku' => 'LOCALIZED-LARGE',
            'price' => 12.50,
            'stock' => 4,
        ]);
        $attribute = Attribute::query()->create([
            'name' => ['en' => 'Material', 'ar' => 'الخامة'],
            'slug' => 'material',
            'type' => 'select',
        ]);
        $option = AttributeValue::query()->create([
            'attribute_id' => $attribute->id,
            'value' => ['en' => 'Soy wax', 'ar' => 'شمع الصويا'],
            'slug' => 'soy-wax',
        ]);
        $product->attributeValues()->create([
            'attribute_id' => $attribute->id,
            'attribute_value_id' => $option->id,
        ]);

        $this->withHeader('Accept-Language', 'ar')->getJson('/api/v1/products/localized-soy-wax')
            ->assertOk()
            ->assertJsonPath('data.name', 'شمع الصويا')
            ->assertJsonPath('data.shortDescription', 'شمع نظيف')
            ->assertJsonPath('data.description', 'وصف عربي')
            ->assertJsonPath('data.category.name', 'الشموع')
            ->assertJsonPath('data.variants.0.name', 'كبير')
            ->assertJsonPath('data.attributes.0.name', 'الخامة')
            ->assertJsonPath('data.attributes.0.value', 'شمع الصويا')
            ->assertJsonPath('data.specifications.الخامة', 'شمع الصويا')
            ->assertJsonPath('data.usageNotes', 'يستخدم بعناية')
            ->assertJsonPath('data.safetyWarnings', 'يحفظ بعيداً عن الحرارة')
            ->assertJsonPath('data.metaTitle', 'شمع الصويا للشموع')
            ->assertJsonPath('data.metaDescription', 'وصف عربي لمحركات البحث');

        $this->withHeader('Accept-Language', 'en')->getJson('/api/v1/products/localized-soy-wax')
            ->assertOk()
            ->assertJsonPath('data.name', 'Soy Wax')
            ->assertJsonPath('data.category.name', 'Candles')
            ->assertJsonPath('data.variants.0.name', 'Large')
            ->assertJsonPath('data.attributes.0.name', 'Material')
            ->assertJsonPath('data.attributes.0.value', 'Soy wax')
            ->assertJsonPath('data.specifications.Material', 'Soy wax');
    }

    public function test_missing_or_invalid_language_defaults_to_arabic(): void
    {
        Category::query()->create([
            'name' => ['en' => 'Candles', 'ar' => 'الشموع'],
            'slug' => 'candles',
            'is_active' => true,
        ]);

        $this->withHeader('Accept-Language', '')->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'الشموع');

        $this->withHeader('Accept-Language', 'fr-FR')
            ->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'الشموع');
    }

    public function test_regional_english_header_is_normalized(): void
    {
        Category::query()->create([
            'name' => ['en' => 'Candles', 'ar' => 'الشموع'],
            'slug' => 'candles',
            'is_active' => true,
        ]);

        $this->withHeader('Accept-Language', 'en-US,en;q=0.9')
            ->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Candles');
    }

    public function test_category_endpoints_expose_spatie_media_image(): void
    {
        Storage::fake('public');
        $category = Category::query()->create([
            'name' => ['en' => 'Candles', 'ar' => 'Candles'],
            'slug' => 'candles',
            'is_active' => true,
        ]);
        $category->addMedia(UploadedFile::fake()->image('candles.jpg'))
            ->toMediaCollection('category_image');

        $this->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonPath('data.0.image.url', fn (string $url): bool => str_contains($url, '/storage/'));

        $this->getJson('/api/v1/categories/candles')
            ->assertOk()
            ->assertJsonPath('data.image.url', fn (string $url): bool => str_contains($url, '/storage/'));
    }

    public function test_boolean_product_filters_accept_query_string_ones_and_zeroes(): void
    {
        $category = Category::query()->create([
            'name' => ['en' => 'Candles'],
            'slug' => 'candles',
            'is_active' => true,
        ]);

        foreach ([true => 'new-arrival', false => 'existing-product'] as $isNewArrival => $slug) {
            Product::query()->create([
                'category_id' => $category->id,
                'name' => ['en' => $slug],
                'slug' => $slug,
                'short_description' => ['en' => $slug],
                'description' => ['en' => $slug],
                'base_price' => 10,
                'status' => 'active',
                'is_visible' => true,
                'is_new_arrival' => $isNewArrival,
            ]);
        }

        $this->getJson('/api/v1/products?new_arrival=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'new-arrival');

        $this->getJson('/api/v1/products?new_arrival=0')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'existing-product');
    }

    public function test_draft_products_are_not_public(): void
    {
        $category = Category::query()->create(['name' => ['en' => 'Hidden'], 'slug' => 'hidden', 'is_active' => true]);
        Product::query()->create(['category_id' => $category->id, 'name' => ['en' => 'Draft'], 'slug' => 'draft', 'short_description' => ['en' => 'Draft'], 'description' => ['en' => 'Draft'], 'base_price' => 1, 'status' => 'draft']);
        $this->getJson('/api/v1/products/draft')->assertNotFound();
    }
}
