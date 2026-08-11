<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class AttributeValue extends Model
{
    use HasTranslations;

    protected $fillable = ['attribute_id', 'value', 'slug', 'sort_order'];

    public array $translatable = ['value'];

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }
}
