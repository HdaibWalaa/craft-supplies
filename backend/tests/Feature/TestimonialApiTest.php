<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TestimonialApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_testimonials_return_localized_public_products_for_guest_authors(): void
    {
        $product = $this->createProduct();
        $product->reviews()->create([
            'user_id' => null,
            'author_name' => 'Guest Maker',
            'rating' => 5,
            'comment' => 'A useful review.',
            'status' => 'approved',
        ]);

        $this->withHeader('Accept-Language', 'ar')->getJson('/api/v1/testimonials')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.authorName', 'Guest Maker')
            ->assertJsonPath('data.0.product.name', 'شمع الصويا');

        $this->withHeader('Accept-Language', 'en')->getJson('/api/v1/testimonials')
            ->assertOk()
            ->assertJsonPath('data.0.product.name', 'Soy Wax');
    }

    public function test_testimonials_exclude_reviews_for_soft_deleted_products_without_crashing(): void
    {
        $product = $this->createProduct();
        $product->reviews()->create([
            'author_name' => 'Historical Maker',
            'rating' => 5,
            'comment' => 'Historical review.',
            'status' => 'approved',
        ]);
        $product->delete();

        $this->getJson('/api/v1/testimonials')
            ->assertOk()
            ->assertExactJson(['data' => []]);
    }

    public function test_testimonials_support_empty_and_multiple_results(): void
    {
        $this->getJson('/api/v1/testimonials')->assertOk()->assertExactJson(['data' => []]);

        $product = $this->createProduct();
        foreach (['First Maker', 'Second Maker'] as $author) {
            $product->reviews()->create([
                'author_name' => $author,
                'rating' => 5,
                'comment' => $author.' review.',
                'status' => 'approved',
            ]);
        }

        $this->getJson('/api/v1/testimonials')->assertOk()->assertJsonCount(2, 'data');
    }

    private function createProduct(): Product
    {
        $category = Category::query()->create([
            'name' => ['ar' => 'مستلزمات الشموع', 'en' => 'Candle Supplies'],
            'slug' => 'testimonial-candles',
            'is_active' => true,
        ]);

        return Product::query()->create([
            'category_id' => $category->id,
            'name' => ['ar' => 'شمع الصويا', 'en' => 'Soy Wax'],
            'slug' => 'testimonial-soy-wax',
            'sku' => 'TEST-WAX',
            'short_description' => ['ar' => 'وصف قصير', 'en' => 'Short description'],
            'description' => ['ar' => 'الوصف', 'en' => 'Description'],
            'base_price' => 1,
            'status' => 'active',
            'is_visible' => true,
        ]);
    }
}
