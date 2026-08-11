<?php

namespace Database\Seeders;

use App\Models\DiscountCode;
use Illuminate\Database\Seeder;

class DiscountCodeSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['code' => 'WELCOME10', 'type' => 'percentage', 'value' => 10, 'minimum_spend' => 0],
            ['code' => 'CRAFT20', 'type' => 'percentage', 'value' => 20, 'minimum_spend' => 75],
            ['code' => 'SHIP5OFF', 'type' => 'fixed', 'value' => 5, 'minimum_spend' => 25],
        ] as $discount) {
            DiscountCode::query()->updateOrCreate(['code' => $discount['code']], [...$discount, 'is_active' => true]);
        }
    }
}
