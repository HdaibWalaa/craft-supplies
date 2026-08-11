<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class ProductAttributeValue extends Model
{
    use HasTranslations;

    protected $fillable = ['product_id', 'attribute_id', 'attribute_value_id', 'value'];

    public array $translatable = ['value'];

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }

    public function option()
    {
        return $this->belongsTo(AttributeValue::class, 'attribute_value_id');
    }
}
