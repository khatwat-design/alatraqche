<?php

namespace Tests\Feature;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_send_otp_returns_success(): void
    {
        Customer::factory()->create([
            'phone' => '07712345678',
            'password' => Hash::make('old-password'),
        ]);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'phone' => '07712345678',
        ]);

        $response->assertOk()
            ->assertJsonPath('ok', true);

        $this->assertDatabaseHas('customer_password_reset_tokens', [
            'phone' => '07712345678',
        ]);
    }

    public function test_send_otp_returns_404_for_unknown_phone(): void
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'phone' => '07799999999',
        ]);

        $response->assertStatus(404);
    }

    public function test_send_otp_returns_404_when_no_password_set(): void
    {
        Customer::factory()->withoutPassword()->create([
            'phone' => '07712345678',
        ]);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'phone' => '07712345678',
        ]);

        $response->assertStatus(404);
    }

    public function test_reset_password_with_valid_otp(): void
    {
        $customer = Customer::factory()->create([
            'phone' => '07712345678',
            'password' => Hash::make('old-password'),
        ]);

        DB::table('customer_password_reset_tokens')->insert([
            'phone' => '07712345678',
            'token' => '123456',
            'expires_at' => now()->addMinutes(15),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'phone' => '07712345678',
            'token' => '123456',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonStructure(['ok', 'token', 'customer']);

        $customer->refresh();
        $this->assertTrue(Hash::check('new-password-123', $customer->password));

        $this->assertDatabaseHas('customer_password_reset_tokens', [
            'phone' => '07712345678',
            'token' => '123456',
            'used_at' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    public function test_reset_password_fails_with_wrong_otp(): void
    {
        Customer::factory()->create([
            'phone' => '07712345678',
            'password' => Hash::make('old-password'),
        ]);

        DB::table('customer_password_reset_tokens')->insert([
            'phone' => '07712345678',
            'token' => '123456',
            'expires_at' => now()->addMinutes(15),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'phone' => '07712345678',
            'token' => '999999',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertStatus(422);
    }

    public function test_reset_password_fails_with_expired_otp(): void
    {
        Customer::factory()->create([
            'phone' => '07712345678',
            'password' => Hash::make('old-password'),
        ]);

        DB::table('customer_password_reset_tokens')->insert([
            'phone' => '07712345678',
            'token' => '123456',
            'expires_at' => now()->subMinute(),
            'created_at' => now()->subMinutes(30),
            'updated_at' => now()->subMinutes(30),
        ]);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'phone' => '07712345678',
            'token' => '123456',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertStatus(422);
    }

    public function test_reset_password_validates_required_fields(): void
    {
        $response = $this->postJson('/api/v1/auth/reset-password', []);

        $response->assertStatus(422);
    }

    public function test_send_otp_validates_required_fields(): void
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', []);

        $response->assertStatus(422);
    }
}
