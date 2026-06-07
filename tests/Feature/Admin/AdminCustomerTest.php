<?php

namespace Tests\Feature\Admin;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCustomerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->token = $this->admin->createToken('admin')->plainTextToken;
    }

    public function test_index_returns_paginated_customers()
    {
        Customer::factory()->count(5)->create();

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/customers');

        $response->assertOk();
        $response->assertJsonStructure([
            'customers' => [],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
        $this->assertCount(5, $response->json('customers'));
    }

    public function test_index_can_search_by_name()
    {
        Customer::factory()->create(['name' => 'أحمد علي']);
        Customer::factory()->count(3)->create();

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/customers?search=' . urlencode('أحمد'));

        $response->assertOk();
        $customers = $response->json('customers');
        $this->assertNotNull($customers);
        $this->assertCount(1, $customers);
        $this->assertEquals('أحمد علي', $customers[0]['name']);
    }

    public function test_show_returns_customer()
    {
        $customer = Customer::factory()->create();

        $response = $this->withToken($this->token)
            ->getJson("/api/v1/admin/customers/{$customer->id}");

        $response->assertOk();
        $response->assertJsonPath('id', $customer->id);
        $response->assertJsonPath('name', $customer->name);
        $response->assertJsonPath('phone', $customer->phone);
    }

    public function test_show_returns_404_for_nonexistent_customer()
    {
        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/customers/99999');

        $response->assertNotFound()
            ->assertJsonPath('message', 'العميل غير موجود.');
    }

    public function test_store_creates_customer()
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/v1/admin/customers', [
                'name' => 'عميل جديد',
                'phone' => '07712345678',
                'email' => 'customer@example.com',
            ]);

        $response->assertCreated()
            ->assertJsonPath('ok', true);

        $this->assertDatabaseHas('customers', [
            'name' => 'عميل جديد',
            'phone' => '07712345678',
            'email' => 'customer@example.com',
        ]);
    }

    public function test_store_validates_required_fields()
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/v1/admin/customers', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'phone']);
    }

    public function test_update_modifies_customer()
    {
        $customer = Customer::factory()->create([
            'name' => 'اسم قديم',
            'phone' => '07711111111',
            'notes' => 'ملاحظة قديمة',
        ]);

        $response = $this->withToken($this->token)
            ->putJson("/api/v1/admin/customers/{$customer->id}", [
                'name' => 'اسم جديد',
                'phone' => '07722222222',
                'notes' => 'ملاحظة جديدة',
            ]);

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('message', 'تم تحديث العميل بنجاح');

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'name' => 'اسم جديد',
            'phone' => '07722222222',
            'notes' => 'ملاحظة جديدة',
        ]);
    }

    public function test_destroy_deletes_customer()
    {
        $customer = Customer::factory()->create();

        $response = $this->withToken($this->token)
            ->deleteJson("/api/v1/admin/customers/{$customer->id}");

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('message', 'تم حذف العميل بنجاح');

        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
    }

    public function test_destroy_returns_404_for_nonexistent_customer()
    {
        $response = $this->withToken($this->token)
            ->deleteJson('/api/v1/admin/customers/99999');

        $response->assertNotFound()
            ->assertJsonPath('message', 'العميل غير موجود.');
    }
}
