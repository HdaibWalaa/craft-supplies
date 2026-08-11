<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class VerifyRequestedCatalog extends Command
{
    protected $signature = 'catalog:verify-requested';

    protected $description = 'Verify the deterministic bilingual requested catalog';

    public function handle(): int
    {
        /** @var array<int, array<string, mixed>> $catalog */
        $catalog = require database_path('data/requested-catalog.php');
        $categorySlugs = array_column($catalog, 'slug');
        $productSlugs = collect($catalog)->flatMap(fn (array $category) => array_column($category['products'], 0))->all();
        $categories = Category::query()->whereIn('slug', $categorySlugs)->get();
        $products = Product::query()->whereIn('slug', $productSlugs)->with('variants')->get();
        $translatedFields = ['short_description', 'description', 'safety_warnings', 'usage_notes', 'specifications', 'meta_title', 'meta_description'];

        $correctRelationships = collect($catalog)->sum(function (array $category): int {
            $slugs = array_column($category['products'], 0);

            return Product::query()
                ->whereIn('slug', $slugs)
                ->whereHas('category', fn ($query) => $query->where('slug', $category['slug']))
                ->count();
        });

        $results = [
            ['Database driver', DB::connection()->getDriverName(), 'mysql'],
            ['Database name', DB::connection()->getDatabaseName(), DB::connection()->getDatabaseName()],
            ['Requested categories', $categories->count(), 8],
            ['Requested products', $products->count(), 107],
            ['Correct relationships', $correctRelationships, 107],
            ['Unique product slugs', $products->pluck('slug')->unique()->count(), 107],
            ['Unique product SKUs', $products->pluck('sku')->unique()->count(), 107],
            ['Bilingual product names', $products->filter(fn (Product $product) => filled($product->getTranslation('name', 'ar', false)) && filled($product->getTranslation('name', 'en', false)))->count(), 107],
            ['Complete bilingual content', $products->filter(fn (Product $product) => collect($translatedFields)->every(fn (string $field) => filled($product->getTranslation($field, 'ar', false)) && filled($product->getTranslation($field, 'en', false))))->count(), 107],
            ['Products with variants', $products->filter(fn (Product $product) => $product->variants->isNotEmpty())->count(), 107],
        ];

        $this->table(['Check', 'Actual', 'Expected'], $results);
        $this->line(sprintf(
            'Database totals: %d categories, %d products, %d media rows.',
            Category::withTrashed()->count(),
            Product::withTrashed()->count(),
            Media::query()->count(),
        ));
        $failed = collect($results)->contains(fn (array $result) => $result[1] !== $result[2]);

        return $failed ? self::FAILURE : self::SUCCESS;
    }
}
