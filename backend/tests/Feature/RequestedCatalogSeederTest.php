<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Database\Seeders\RequestedCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RequestedCatalogSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_requested_catalog_is_bilingual_related_unique_and_idempotent(): void
    {
        $this->seed(RequestedCatalogSeeder::class);
        $this->seed(RequestedCatalogSeeder::class);

        $catalog = require database_path('data/requested-catalog.php');
        $categorySlugs = array_column($catalog, 'slug');
        $productSlugs = collect($catalog)->flatMap(fn (array $category) => array_column($category['products'], 0));

        $this->assertCount(8, $categorySlugs);
        $this->assertCount(107, $productSlugs);
        $this->assertSame(8, Category::query()->whereIn('slug', $categorySlugs)->count());
        $this->assertSame(107, Product::query()->whereIn('slug', $productSlugs)->count());
        $this->assertSame(107, Product::query()->whereIn('slug', $productSlugs)->distinct()->count('slug'));
        $this->assertSame(107, Product::query()->whereIn('slug', $productSlugs)->distinct()->count('sku'));

        foreach ($catalog as $category) {
            $slugs = array_column($category['products'], 0);
            $this->assertSame(
                count($slugs),
                Product::query()->whereIn('slug', $slugs)->whereHas('category', fn ($query) => $query->where('slug', $category['slug']))->count(),
            );
        }

        $soyWax = Product::query()->where('slug', 'soy-wax')->with('category', 'variants')->firstOrFail();
        $this->assertSame('شمع الصويا', $soyWax->getTranslation('name', 'ar'));
        $this->assertSame('Soy Wax', $soyWax->getTranslation('name', 'en'));
        $this->assertSame('candles-fragrances-supplies', $soyWax->category->slug);
        $this->assertNotEmpty($soyWax->getTranslation('specifications', 'ar'));
        $this->assertNotEmpty($soyWax->getTranslation('specifications', 'en'));
        $this->assertCount(1, $soyWax->variants);
    }

    public function test_product_api_returns_the_selected_catalog_translation(): void
    {
        $this->seed(RequestedCatalogSeeder::class);

        $this->withHeader('Accept-Language', 'ar')->getJson('/api/v1/products/soy-wax')
            ->assertOk()
            ->assertJsonPath('data.name', 'شمع الصويا')
            ->assertJsonPath('data.category.name', 'مستلزمات الشموع والعطور');

        $this->withHeader('Accept-Language', 'en')->getJson('/api/v1/products/soy-wax')
            ->assertOk()
            ->assertJsonPath('data.name', 'Soy Wax')
            ->assertJsonPath('data.category.name', 'Candles & Fragrances Supplies');
    }

    public function test_representative_product_from_every_catalog_type_is_bilingual(): void
    {
        $this->seed(RequestedCatalogSeeder::class);

        $catalog = require database_path('data/requested-catalog.php');
        foreach ($catalog as $category) {
            [$slug, $arabicName, $englishName] = $category['products'][0];

            $this->withHeader('Accept-Language', 'ar')->getJson('/api/v1/products/'.$slug)
                ->assertOk()
                ->assertJsonPath('data.name', $arabicName)
                ->assertJsonPath('data.category.name', $category['ar']);

            $this->withHeader('Accept-Language', 'en')->getJson('/api/v1/products/'.$slug)
                ->assertOk()
                ->assertJsonPath('data.name', $englishName)
                ->assertJsonPath('data.category.name', $category['en']);
        }
    }
}
