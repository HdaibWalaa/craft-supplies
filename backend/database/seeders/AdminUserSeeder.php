<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(['email' => 'admin@craftsupply.test'], [
            'name' => 'Craft Supplies Admin', 'password' => 'Admin123!', 'role' => UserRole::Admin, 'is_active' => true,
        ]);
        User::query()->updateOrCreate(['email' => 'customer@example.test'], [
            'name' => 'Demo Customer', 'password' => 'Customer123!', 'role' => UserRole::Customer, 'is_active' => true,
        ]);
    }
}
