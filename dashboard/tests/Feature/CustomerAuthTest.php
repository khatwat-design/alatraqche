<?php

namespace Tests\Feature;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CustomerAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register()
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'أحمد',
            'phone' => '07712345678',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('ok', true)
            ->assertJsonStructure([
                'ok', 'token', 'tokenType', 'customer' => ['id', 'name', 'phone'],
            ]);

        $this->assertDatabaseHas('customers', [
            'phone' => '07712345678',
            'name' => 'أحمد',
        ]);
    }

    public function test_customer_cannot_register_duplicate_phone()
    {
        Customer::factory()->create(['phone' => '07712345678']);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'أحمد',
            'phone' => '07712345678',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    public function test_customer_can_login()
    {
        Customer::factory()->create([
            'phone' => '07712345678',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'phone' => '07712345678',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonStructure(['ok', 'token', 'customer']);
    }

    public function test_customer_cannot_login_with_wrong_password()
    {
        Customer::factory()->create([
            'phone' => '07712345678',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'phone' => '07712345678',
            'password' => 'wrong-password',
        ]);

        $response->assertUnauthorized();
    }

    public function test_customer_cannot_login_if_no_password_set()
    {
        Customer::factory()->withoutPassword()->create([
            'phone' => '07712345678',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'phone' => '07712345678',
            'password' => 'anything',
        ]);

        $response->assertUnauthorized();
    }

    public function test_register_normalizes_phone()
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'أحمد',
            'phone' => '009647712345678',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('customers', ['phone' => '07712345678']);
    }

    public function test_login_normalizes_phone()
    {
        Customer::factory()->create([
            'phone' => '07712345678',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'phone' => '9647712345678',
            'password' => 'password123',
        ]);

        $response->assertOk();
    }

    public function test_authenticated_customer_can_logout()
    {
        $customer = Customer::factory()->create();
        $token = $customer->createToken('store')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson('/api/v1/auth/logout');

        $response->assertOk();
        $this->assertCount(0, $customer->tokens);
    }

    public function test_authenticated_customer_can_get_profile()
    {
        $customer = Customer::factory()->create(['name' => 'أحمد']);
        $token = $customer->createToken('store')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/v1/auth/me');

        $response->assertOk()
            ->assertJsonPath('customer.name', 'أحمد');
    }

    public function test_unauthenticated_cannot_access_profile()
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertUnauthorized();
    }

    public function test_unauthenticated_cannot_access_logout()
    {
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertUnauthorized();
    }

    public function test_register_validates_required_fields()
    {
        $response = $this->postJson('/api/v1/auth/register', []);

        $response->assertStatus(422);
    }

    public function test_register_validates_password_confirmation()
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'أحمد',
            'phone' => '07712345678',
            'password' => 'password123',
            'password_confirmation' => 'different',
        ]);

        $response->assertStatus(422);
    }
}
