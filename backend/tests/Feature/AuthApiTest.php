<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register_and_receive_sanctum_token(): void
    {
        $this->postJson('/api/v1/auth/register', ['name' => 'Maker', 'email' => 'maker@example.test', 'password' => 'Maker123!', 'password_confirmation' => 'Maker123!'])
            ->assertCreated()->assertJsonPath('data.user.role', 'customer')->assertJsonStructure(['data' => ['user', 'token']]);
        $this->assertDatabaseHas('users', ['email' => 'maker@example.test', 'role' => UserRole::Customer->value]);
    }

    public function test_login_me_and_logout_flow(): void
    {
        User::factory()->create(['email' => 'customer@example.test', 'password' => 'Customer123!', 'role' => UserRole::Customer]);
        $token = $this->postJson('/api/v1/auth/login', ['email' => 'customer@example.test', 'password' => 'Customer123!'])->assertOk()->json('data.token');
        $this->withToken($token)->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('data.email', 'customer@example.test');
        $this->withToken($token)->postJson('/api/v1/auth/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_invalid_credentials_do_not_disclose_account_state(): void
    {
        $this->postJson('/api/v1/auth/login', ['email' => 'nobody@example.test', 'password' => 'incorrect'])->assertUnprocessable()->assertJsonValidationErrors('email');
    }
}
