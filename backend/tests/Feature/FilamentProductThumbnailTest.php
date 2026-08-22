<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Filament\Resources\Products\Pages\CreateProduct;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

class FilamentProductThumbnailTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        Filament::setCurrentPanel(Filament::getPanel('admin'));
        $this->actingAs(User::factory()->create([
            'role' => UserRole::Admin,
            'is_active' => true,
        ]));
    }

    public function test_thumbnail_is_persisted_when_creating_a_product_in_filament(): void
    {
        $category = $this->createCategory('create-thumbnail-category');

        Livewire::test(CreateProduct::class)
            ->fillForm([
                'category_id' => $category->id,
                'slug' => 'created-with-thumbnail',
                'name' => ['en' => 'Created product', 'ar' => 'منتج جديد'],
                'short_description' => ['en' => 'Short', 'ar' => 'مختصر'],
                'description' => ['en' => 'Description', 'ar' => 'الوصف'],
                'base_price' => 10,
                'status' => 'active',
                'is_visible' => true,
                'thumbnail' => [UploadedFile::fake()->image('created-thumbnail.jpg')],
                'variants' => [[
                    'name' => ['en' => 'Default', 'ar' => 'افتراضي'],
                    'sku' => 'CREATED-THUMBNAIL-DEFAULT',
                    'price' => 10,
                    'stock' => 1,
                    'low_stock_threshold' => 5,
                    'is_active' => true,
                ]],
                'attributeValues' => [],
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $product = Product::query()->where('slug', 'created-with-thumbnail')->firstOrFail();
        $this->assertPersistedThumbnail($product, 'created-thumbnail.jpg');
    }

    public function test_thumbnail_is_persisted_and_rehydrated_when_editing_a_product_in_filament(): void
    {
        $category = $this->createCategory('edit-thumbnail-category');
        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => ['en' => 'Edited product', 'ar' => 'منتج معدل'],
            'slug' => 'edited-with-thumbnail',
            'short_description' => ['en' => 'Short', 'ar' => 'مختصر'],
            'description' => ['en' => 'Description', 'ar' => 'الوصف'],
            'base_price' => 10,
            'status' => 'active',
            'is_visible' => true,
        ]);

        Livewire::test(EditProduct::class, ['record' => $product->getRouteKey()])
            ->fillForm([
                'thumbnail' => [UploadedFile::fake()->image('edited-thumbnail.jpg')],
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertPersistedThumbnail($product->refresh(), 'edited-thumbnail.jpg');

        $mediaUuid = $product->getFirstMedia('thumbnail')->uuid;
        Livewire::test(EditProduct::class, ['record' => $product->getRouteKey()])
            ->assertSchemaStateSet(['thumbnail' => $mediaUuid]);
    }

    public function test_multiple_product_images_are_persisted_and_rehydrated(): void
    {
        $category = $this->createCategory('product-images-category');
        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => ['en' => 'Gallery product', 'ar' => 'Gallery product'],
            'slug' => 'gallery-product',
            'short_description' => ['en' => 'Short', 'ar' => 'Short'],
            'description' => ['en' => 'Description', 'ar' => 'Description'],
            'base_price' => 10,
            'status' => 'active',
            'is_visible' => true,
        ]);

        Livewire::test(EditProduct::class, ['record' => $product->getRouteKey()])
            ->fillForm([
                'product_images' => [
                    UploadedFile::fake()->image('image-1.jpg'),
                    UploadedFile::fake()->image('image-2.jpg'),
                    UploadedFile::fake()->image('image-3.jpg'),
                    UploadedFile::fake()->image('image-4.jpg'),
                ],
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $media = $product->refresh()->getMedia('product_images');
        $this->assertCount(4, $media);
        $this->assertSame(4, $product->media()->where('collection_name', 'product_images')->count());
        $this->assertNull($product->getFirstMedia('thumbnail'));

        $state = $media->pluck('uuid')->all();

        Livewire::test(EditProduct::class, ['record' => $product->getRouteKey()])
            ->assertSchemaStateSet(['product_images' => $state]);
    }

    private function createCategory(string $slug): Category
    {
        return Category::query()->create([
            'name' => ['en' => 'Category', 'ar' => 'تصنيف'],
            'slug' => $slug,
            'is_active' => true,
        ]);
    }

    private function assertPersistedThumbnail(Product $product, string $fileName): void
    {
        $media = $product->getFirstMedia('thumbnail');

        $this->assertNotNull($media);
        $this->assertSame('thumbnail', $media->collection_name);
        $this->assertSame('public', $media->disk);
        $this->assertSame($product->id, $media->model_id);
        $this->assertSame(pathinfo($fileName, PATHINFO_EXTENSION), pathinfo($media->file_name, PATHINFO_EXTENSION));
        Storage::disk($media->disk)->assertExists($media->getPathRelativeToRoot());
        $this->assertNotSame('', $product->getFirstMediaUrl('thumbnail'));
    }
}
