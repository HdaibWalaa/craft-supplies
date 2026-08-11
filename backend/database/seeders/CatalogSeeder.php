<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use RuntimeException;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/legacy-seed.json');
        $seed = json_decode((string) file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
        $categoryNames = [
            'candle-making' => 'صناعة الشموع', 'resin-epoxy' => 'الراتنج والإيبوكسي', 'soap-making' => 'صناعة الصابون',
            'molds' => 'القوالب', 'fragrances-pigments' => 'العطور والأصباغ', 'concrete-supplies' => 'مستلزمات الخرسانة',
            'wooden-products' => 'المنتجات الخشبية', 'kits-bundles' => 'الأطقم والحزم',
        ];

        $categories = [];
        foreach ($seed['CATEGORY_SEED'] as $item) {
            $categories[$item['slug']] = Category::query()->updateOrCreate(['slug' => $item['slug']], [
                'name' => ['en' => $item['name'], 'ar' => $categoryNames[$item['slug']] ?? $item['name']],
                'description' => ['en' => $item['description'], 'ar' => $item['description']],
                'color_theme' => $item['colorTheme'], 'sort_order' => $item['sortOrder'], 'is_active' => true,
            ]);
        }

        $products = [];
        foreach ($seed['PRODUCTS'] as $item) {
            $category = $categories[$item['categorySlug']] ?? throw new RuntimeException("Unknown category {$item['categorySlug']}");
            $product = Product::query()->updateOrCreate(['slug' => Str::slug($item['name'])], [
                'category_id' => $category->id,
                'name' => $this->translated($item['name']),
                'short_description' => $this->translated($item['shortDescription']),
                'description' => $this->translated($item['description']),
                'specifications' => $this->translated($item['specifications'] ?? []),
                'safety_warnings' => isset($item['safetyWarnings']) ? $this->translated($item['safetyWarnings']) : null,
                'usage_notes' => isset($item['usageNotes']) ? $this->translated($item['usageNotes']) : null,
                'base_price' => $item['basePrice'], 'compare_at_price' => $item['compareAtPrice'] ?? null,
                'status' => 'active', 'is_visible' => true, 'is_featured' => $item['isFeatured'] ?? false,
                'is_new_arrival' => $item['isNewArrival'] ?? false,
            ]);
            $products[$item['name']] = $product;

            foreach ($item['variants'] as $index => $variant) {
                $product->variants()->updateOrCreate(['sku' => $variant['sku']], [
                    'name' => $this->translated($variant['name']), 'price' => $variant['price'], 'stock' => $variant['stock'],
                    'low_stock_threshold' => 5, 'is_active' => true, 'sort_order' => $index,
                ]);
            }
            foreach ($item['attributes'] ?? [] as $key => $value) {
                $attribute = Attribute::query()->firstOrCreate(['slug' => Str::slug(Str::snake($key))], [
                    'name' => $this->translated(Str::headline($key)), 'type' => 'select', 'is_filterable' => true,
                ]);
                $category->attributes()->syncWithoutDetaching([$attribute->id]);
                $option = AttributeValue::query()->firstOrCreate(['attribute_id' => $attribute->id, 'slug' => Str::slug($value)], ['value' => $this->translated($value)]);
                $product->attributeValues()->updateOrCreate(['attribute_id' => $attribute->id], ['attribute_value_id' => $option->id]);
            }
        }

        foreach ($seed['BUNDLES'] as $item) {
            $product = Product::query()->updateOrCreate(['slug' => Str::slug($item['name'])], [
                'category_id' => $categories['kits-bundles']->id, 'name' => $this->translated($item['name']),
                'short_description' => $this->translated($item['shortDescription']), 'description' => $this->translated($item['description']),
                'base_price' => $item['basePrice'], 'compare_at_price' => $item['compareAtPrice'] ?? null,
                'status' => 'active', 'is_visible' => true, 'is_bundle' => true, 'is_featured' => true,
            ]);
            $product->variants()->updateOrCreate(['sku' => 'KIT-'.Str::upper(Str::substr(Str::slug($item['name'], ''), 0, 24))], [
                'name' => $this->translated('Complete Kit'), 'price' => $item['basePrice'], 'stock' => 25, 'is_active' => true,
            ]);
            $ids = collect($item['componentNames'])->map(fn (string $name) => $products[$name]?->id)->filter()->all();
            $product->relatedProducts()->syncWithPivotValues($ids, ['type' => 'bundle']);
            $products[$item['name']] = $product;
        }

        foreach ($seed['BLOG_POSTS'] as $item) {
            $post = BlogPost::query()->updateOrCreate(['slug' => Str::slug($item['title'])], [
                'title' => $this->translated($item['title']), 'excerpt' => $this->translated($item['excerpt']),
                'content' => $this->translated($item['content']), 'status' => 'published', 'published_at' => now(),
            ]);
            $post->products()->sync(collect($item['products'])->map(fn (string $name) => $products[$name]?->id)->filter());
        }

        foreach (array_slice(array_values($products), 0, 3) as $index => $product) {
            $product->reviews()->updateOrCreate(['author_name' => 'Demo Maker '.($index + 1)], ['rating' => 5, 'title' => 'Excellent quality', 'comment' => 'Great quality and arrived quickly. I will definitely reorder.', 'status' => 'approved']);
            $product->update(['rating' => 5, 'review_count' => 1]);
        }
    }

    private function translated(mixed $value): array
    {
        return ['en' => $value, 'ar' => $value];
    }
}
