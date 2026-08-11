<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class ProductVariant extends Model
{
    use HasTranslations;

    protected $fillable = ['product_id', 'name', 'sku', 'price', 'sale_price', 'stock', 'low_stock_threshold', 'is_active', 'sort_order'];

    public array $translatable = ['name'];

    protected function casts(): array
    {
        return ['price' => 'decimal:2', 'sale_price' => 'decimal:2', 'is_active' => 'boolean'];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
