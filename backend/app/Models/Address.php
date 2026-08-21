<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    protected $fillable = ['user_id', 'full_name', 'phone', 'governorate', 'address', 'country_code', 'first_name', 'last_name', 'company', 'line_1', 'line_2', 'city', 'region', 'postal_code', 'is_default_shipping', 'is_default_billing'];

    protected function casts(): array
    {
        return ['is_default_shipping' => 'boolean', 'is_default_billing' => 'boolean'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
