<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_active_administrators_can_access_filament(): void
    {
        $panel = Filament::getPanel('admin');
        $customer = User::factory()->create(['role' => UserRole::Customer, 'is_active' => true]);
        $admin = User::factory()->create(['role' => UserRole::Admin, 'is_active' => true]);
        $disabledAdmin = User::factory()->create(['role' => UserRole::Admin, 'is_active' => false]);
        $this->assertFalse($customer->canAccessPanel($panel));
        $this->assertTrue($admin->canAccessPanel($panel));
        $this->assertFalse($disabledAdmin->canAccessPanel($panel));
    }
}
