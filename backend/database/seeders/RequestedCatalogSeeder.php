<?php

namespace Database\Seeders;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RequestedCatalogSeeder extends Seeder
{
    private int $categoriesCreated = 0;

    private int $categoriesUpdated = 0;

    private int $productsCreated = 0;

    private int $productsUpdated = 0;

    public function run(): void
    {
        /** @var array<int, array<string, mixed>> $catalog */
        $catalog = require database_path('data/requested-catalog.php');

        DB::transaction(function () use ($catalog): void {
            foreach ($catalog as $categoryData) {
                $category = $this->upsertCategory($categoryData);

                foreach ($categoryData['products'] as $index => [$slug, $arabicName, $englishName]) {
                    $this->upsertProduct(
                        $category,
                        $categoryData,
                        $index + 1,
                        $slug,
                        $arabicName,
                        $englishName,
                    );
                }
            }
        });

        $this->command?->info(sprintf(
            'Requested catalog: categories %d created / %d updated; products %d created / %d updated.',
            $this->categoriesCreated,
            $this->categoriesUpdated,
            $this->productsCreated,
            $this->productsUpdated,
        ));
    }

    /** @param array<string, mixed> $data */
    private function upsertCategory(array $data): Category
    {
        $category = Category::withTrashed()->where('slug', $data['slug'])->first();
        $category ? $this->categoriesUpdated++ : $this->categoriesCreated++;

        $category ??= new Category;
        if ($category->trashed()) {
            $category->restore();
        }

        $category->fill([
            'parent_id' => null,
            'slug' => $data['slug'],
            'name' => ['ar' => $data['ar'], 'en' => $data['en']],
            'description' => ['ar' => $data['description_ar'], 'en' => $data['description_en']],
            'meta_title' => [
                'ar' => $data['ar'].' | Craft Supplies',
                'en' => $data['en'].' | Craft Supplies',
            ],
            'meta_description' => [
                'ar' => 'تسوق '.$data['ar'].' لمشاريعك الحرفية واكتشف الخامات والأدوات المناسبة من Craft Supplies.',
                'en' => 'Shop '.$data['en'].' for your craft projects and explore suitable materials and tools from Craft Supplies.',
            ],
            'color_theme' => $category->exists ? $category->color_theme : 'terracotta',
            'is_active' => true,
            'sort_order' => $data['sort'],
        ])->save();

        return $category;
    }

    /** @param array<string, mixed> $categoryData */
    private function upsertProduct(
        Category $category,
        array $categoryData,
        int $sequence,
        string $slug,
        string $arabicName,
        string $englishName,
    ): void {
        $product = Product::withTrashed()->where('slug', $slug)->first();
        $isNew = $product === null;
        $isNew ? $this->productsCreated++ : $this->productsUpdated++;

        $product ??= new Product;
        if ($product->trashed()) {
            $product->restore();
        }

        $sku = sprintf('%s-%03d', $categoryData['sku'], $sequence);
        $applicationAr = $this->application('ar', $categoryData['slug']);
        $applicationEn = $this->application('en', $categoryData['slug']);

        $attributes = [
            'category_id' => $category->id,
            'slug' => $slug,
            'sku' => $sku,
            'name' => ['ar' => $arabicName, 'en' => $englishName],
            'short_description' => [
                'ar' => $arabicName.' مناسب لـ'.$applicationAr.' ويساعد على تجهيز مشاريع حرفية مرتبة بحسب طبيعة الخامة أو الأداة.',
                'en' => $englishName.' is suitable for '.$applicationEn.' and supports well-prepared craft projects according to the material or tool being used.',
            ],
            'description' => [
                'ar' => $arabicName.' من مستلزمات '.$categoryData['ar'].'. يمكن استخدامه في '.$applicationAr.' مع الخامات والأدوات المتوافقة، مع مراعاة طبيعة المشروع واتباع تعليمات المنتج قبل البدء.',
                'en' => $englishName.' is part of our '.$categoryData['en'].' collection. It can be used for '.$applicationEn.' with compatible materials and tools, while considering the project requirements and following the product instructions before use.',
            ],
            'safety_warnings' => $this->warnings($slug, $arabicName, $englishName),
            'usage_notes' => [
                'ar' => 'جهّز مساحة العمل والأدوات المناسبة قبل استخدام '.$arabicName.'، واختبر التوافق على كمية أو مساحة صغيرة عند الحاجة. اتبع تعليمات الشركة المصنعة للمادة المستخدمة في المشروع.',
                'en' => 'Prepare the workspace and suitable tools before using '.$englishName.'. Test compatibility on a small amount or area when appropriate, and follow the manufacturer instructions for materials used in the project.',
            ],
            'specifications' => [
                'ar' => ['نوع المنتج' => $arabicName, 'الفئة' => $categoryData['ar'], 'الاستخدام' => $applicationAr],
                'en' => ['Product Type' => $englishName, 'Category' => $categoryData['en'], 'Application' => ucfirst($applicationEn)],
            ],
            'meta_title' => [
                'ar' => $arabicName.' | Craft Supplies',
                'en' => $englishName.' | Craft Supplies',
            ],
            'meta_description' => [
                'ar' => 'تسوق '.$arabicName.' لمشاريع '.$applicationAr.' واكتشف المستلزمات الحرفية المتوافقة من Craft Supplies.',
                'en' => 'Shop '.$englishName.' for '.$applicationEn.' and explore compatible craft supplies from Craft Supplies.',
            ],
        ];

        // Existing commercial values and merchandising choices may be user-created,
        // so only new records receive the safe, non-purchasable placeholders.
        if ($isNew) {
            $attributes += [
                'base_price' => 0,
                'sale_price' => null,
                'compare_at_price' => null,
                'status' => ProductStatus::Active,
                'is_visible' => true,
                'is_featured' => false,
                'is_new_arrival' => false,
                'is_bundle' => false,
            ];
        }

        $product->fill($attributes)->save();

        if (! $product->variants()->exists()) {
            $product->variants()->create([
                'name' => ['ar' => 'افتراضي', 'en' => 'Default'],
                'sku' => $sku.'-DEF',
                'price' => $product->base_price,
                'sale_price' => null,
                'stock' => 0,
                'low_stock_threshold' => 5,
                'is_active' => true,
                'sort_order' => 0,
            ]);
        }
    }

    private function application(string $locale, string $categorySlug): string
    {
        $applications = [
            'resin-supplies' => ['ar' => 'أعمال الريزن والصب والتشطيب', 'en' => 'resin casting and finishing projects'],
            'ready-made-silicone-molds' => ['ar' => 'أعمال الصب وتشكيل القطع الحرفية', 'en' => 'casting and shaping handmade pieces'],
            'raw-silicone-rubber' => ['ar' => 'صناعة القوالب المخصصة', 'en' => 'custom mold-making projects'],
            'soap-making-supplies' => ['ar' => 'مشاريع صناعة الصابون اليدوي', 'en' => 'handmade soap projects'],
            'candles-fragrances-supplies' => ['ar' => 'مشاريع صناعة الشموع والعطور', 'en' => 'candle and fragrance projects'],
            'gypsum-concrete-supplies' => ['ar' => 'أعمال الجبس والكونكريت الحرفية', 'en' => 'gypsum and concrete crafts'],
            'pipe-cleaner-flower-supplies' => ['ar' => 'تنسيق زهور البايب كلينر والباقات', 'en' => 'pipe-cleaner flowers and bouquet arrangements'],
            'giveaways-gifts-materials' => ['ar' => 'تجهيز التوزيعات والهدايا وتغليفها', 'en' => 'assembling and wrapping giveaways and gifts'],
        ];

        return $applications[$categorySlug][$locale];
    }

    /** @return array{ar: string, en: string} */
    private function warnings(string $slug, string $arabicName, string $englishName): array
    {
        $heat = str_contains($slug, 'torch') || str_contains($slug, 'heat-gun') || str_contains($slug, 'hot-glue');
        $dust = str_contains($slug, 'gypsum') || str_contains($slug, 'concrete') || str_contains($slug, 'sandpaper');
        $chemical = preg_match('/resin|hardener|epoxy|alcohol|ink|silicone|pigment|sealer|coat|compound|wax|fragrance|oil|release/', $slug) === 1;

        if ($heat) {
            return [
                'ar' => 'قد تصبح الأداة أو المادة ساخنة. استخدمها على سطح مناسب بعيداً عن المواد القابلة للاشتعال، وتجنب ملامسة الأجزاء الساخنة، واحفظها بعيداً عن متناول الأطفال.',
                'en' => 'The tool or material may become hot. Use it on a suitable surface away from flammable materials, avoid contact with hot parts, and keep it out of reach of children.',
            ];
        }
        if ($dust) {
            return [
                'ar' => 'تجنب استنشاق الغبار واستخدم معدات الحماية المناسبة في مكان جيد التهوية. نظف مساحة العمل بعناية واحفظ المنتج بعيداً عن متناول الأطفال.',
                'en' => 'Avoid inhaling dust and use appropriate protective equipment in a well-ventilated area. Clean the workspace carefully and keep the product out of reach of children.',
            ];
        }
        if ($chemical) {
            return [
                'ar' => 'استخدم '.$arabicName.' في مكان جيد التهوية واتبع تعليمات الشركة المصنعة. استخدم معدات الحماية المناسبة عند الحاجة، وتجنب ملامسة العينين والجلد، واحفظه بعيداً عن متناول الأطفال.',
                'en' => 'Use '.$englishName.' in a well-ventilated area and follow the manufacturer instructions. Use appropriate protective equipment when required, avoid eye and skin contact, and keep it out of reach of children.',
            ];
        }

        return [
            'ar' => 'استخدم المنتج للغرض المخصص له، وافحصه قبل الاستخدام، واحفظ القطع ومواد التغليف بعيداً عن متناول الأطفال.',
            'en' => 'Use the product only for its intended purpose, inspect it before use, and keep small parts and packaging materials out of reach of children.',
        ];
    }
}
