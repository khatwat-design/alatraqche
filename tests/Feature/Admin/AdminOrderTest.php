<?php

namespace Tests\Feature\Admin;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOrderTest extends TestCase
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

    public function test_index_returns_paginated_orders()
    {
        Order::factory()->for(Customer::factory()->create())->count(5)->create();

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/orders');

        $response->assertOk();
        $response->assertJsonStructure([
            'orders' => [],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
        $this->assertCount(5, $response->json('orders'));
    }

    public function test_index_can_filter_by_status()
    {
        Order::factory()->for(Customer::factory()->create())->count(3)->create(['status' => 'pending']);
        Order::factory()->for(Customer::factory()->create())->count(2)->create(['status' => 'delivered']);

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/orders?status=pending');

        $response->assertOk();
        $orders = $response->json('orders');
        $this->assertNotNull($orders);
        $this->assertCount(3, $orders);
        foreach ($orders as $order) {
            $this->assertEquals('pending', $order['status']);
        }
    }

    public function test_index_can_search_by_invoice()
    {
        $customer = Customer::factory()->create();
        Order::factory()->for($customer)->create(['invoice_id' => 'INV-SEARCH01']);
        Order::factory()->for($customer)->count(3)->create();

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/orders?search=SEARCH01');

        $response->assertOk();
        $orders = $response->json('orders');
        $this->assertNotNull($orders);
        $this->assertCount(1, $orders);
        $this->assertEquals('INV-SEARCH01', $orders[0]['invoice_id']);
    }

    public function test_show_returns_order()
    {
        $customer = Customer::factory()->create();
        $order = Order::factory()->for($customer)->create();
        OrderItem::factory()->for($order)->count(2)->create();

        $response = $this->withToken($this->token)
            ->getJson("/api/v1/admin/orders/{$order->id}");

        $response->assertOk();
        $response->assertJsonPath('id', $order->id);
        $response->assertJsonPath('invoice_id', $order->invoice_id);
        $this->assertCount(2, $response->json('items'));
        $this->assertArrayHasKey('customer', $response->json());
    }

    public function test_show_returns_404_for_nonexistent_order()
    {
        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/orders/99999');

        $response->assertNotFound()
            ->assertJsonPath('message', 'الطلب غير موجود.');
    }

    public function test_update_status()
    {
        $order = Order::factory()->for(Customer::factory()->create())->create(['status' => 'pending']);

        $response = $this->withToken($this->token)
            ->putJson("/api/v1/admin/orders/{$order->id}", [
                'status' => 'confirmed',
            ]);

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('message', 'تم تحديث حالة الطلب بنجاح');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_update_validates_status()
    {
        $order = Order::factory()->for(Customer::factory()->create())->create();

        $response = $this->withToken($this->token)
            ->putJson("/api/v1/admin/orders/{$order->id}", [
                'status' => 'invalid-status',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_destroy_deletes_order()
    {
        $order = Order::factory()->for(Customer::factory()->create())->create();
        OrderItem::factory()->for($order)->count(2)->create();

        $response = $this->withToken($this->token)
            ->deleteJson("/api/v1/admin/orders/{$order->id}");

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('message', 'تم حذف الطلب بنجاح');

        $this->assertDatabaseMissing('orders', ['id' => $order->id]);
        $this->assertDatabaseMissing('order_items', ['order_id' => $order->id]);
    }

    public function test_destroy_returns_404_for_nonexistent_order()
    {
        $response = $this->withToken($this->token)
            ->deleteJson('/api/v1/admin/orders/99999');

        $response->assertNotFound()
            ->assertJsonPath('message', 'الطلب غير موجود.');
    }
}
