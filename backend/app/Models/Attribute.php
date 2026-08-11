<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Attribute extends Model
{
    use HasTranslations;

    protected $fillable = ['name', 'slug', 'type', 'is_filterable', 'sort_order'];

    public array $translatable = ['name'];

    protected function casts(): array
    {
        return ['is_filterable' => 'boolean'];
    }

    public function values()
    {
        return $this->hasMany(AttributeValue::class);
    }
}
