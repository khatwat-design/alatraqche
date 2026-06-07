<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login()
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'is_admin' => true,
        ]);

        $response = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'token', 'tokenType', 'user' => ['id', 'name', 'email', 'role', 'is_admin'],
            ]);
    }

    public function test_admin_cannot_login_with_wrong_password()
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'is_admin' => true,
        ]);

        $response = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertUnauthorized()
            ->assertJsonPath('message', 'بيانات الدخول غير صحيحة.');
    }

    public function test_login_validates_email()
    {
        $response = $this->postJson('/api/v1/admin/auth/login', [
            'email' => '',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    public function test_admin_can_get_me()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $token = $admin->createToken('admin')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/v1/admin/auth/me');

        $response->assertOk()
            ->assertJsonPath('user.email', $admin->email)
            ->assertJsonPath('user.is_admin', true);
    }

    public function test_admin_can_logout()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $token = $admin->createToken('admin')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson('/api/v1/admin/auth/logout');

        $response->assertOk()
            ->assertJsonPath('ok', true);

        $this->assertCount(0, $admin->tokens);
    }

    public function test_admin_can_update_profile()
    {
        $admin = User::factory()->create([
            'is_admin' => true,
            'first_name' => 'Old',
            'last_name' => 'Name',
        ]);
        $token = $admin->createToken('admin')->plainTextToken;

        $response = $this->withToken($token)
            ->putJson('/api/v1/admin/auth/profile', [
                'name' => 'New Admin',
                'email' => 'newemail@example.com',
                'phone' => '07712345678',
            ]);

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('message', 'تم تحديث الملف الشخصي بنجاح');

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'first_name' => 'New',
            'last_name' => 'Admin',
            'email' => 'newemail@example.com',
            'phone_number' => '07712345678',
        ]);
    }

    public function test_unauthenticated_cannot_access_admin_routes()
    {
        $response = $this->getJson('/api/v1/admin/auth/me');

        $response->assertUnauthorized();
    }

    public function test_non_admin_cannot_access_admin_routes()
    {
        $user = User::factory()->create(['is_admin' => false]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/v1/admin/dashboard');

        $response->assertForbidden()
            ->assertJsonPath('message', 'غير مصرح بالوصول.');
    }
}
