<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerOrderTest extends TestCase
{
    use RefreshDatabase;

    private Customer $customer;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = Customer::factory()->create();
        $this->token = $this->customer->createToken('store')->plainTextToken;
    }

    public function test_can_list_own_orders()
    {
        Order::factory()->for($this->customer)->count(3)->create();
        Order::factory()->count(2)->create();

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/my/orders');

        $response->assertOk()
            ->assertJsonPath('ok', true);
        $this->assertCount(3, $response->json('data'));
        $this->assertEquals(3, $response->json('meta.total'));
    }

    public function test_orders_are_paginated()
    {
        Order::factory()->for($this->customer)->count(25)->create();

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/my/orders');

        $response->assertOk();
        $this->assertCount(20, $response->json('data'));
        $this->assertEquals(2, $response->json('meta.last_page'));
    }

    public function test_order_list_has_correct_structure()
    {
        Order::factory()->for($this->customer)->pending()->create();

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/my/orders');

        $response->assertOk();
        $order = $response->json('data')[0];
        $this->assertArrayHasKey('invoiceId', $order);
        $this->assertArrayHasKey('status', $order);
        $this->assertArrayHasKey('statusLabel', $order);
        $this->assertArrayHasKey('total', $order);
        $this->assertArrayHasKey('createdAt', $order);
        $this->assertEquals('قيد الانتظار', $order['statusLabel']);
    }

    public function test_can_view_own_order()
    {
        $product = Product::factory()->for(Category::factory()->create())->create();
        $order = Order::factory()->for($this->customer)->create();
        OrderItem::factory()->for($order)->create([
            'product_id' => $product->id,
            'name' => 'منتج اختبار',
        ]);

        $response = $this->withToken($this->token)
            ->getJson("/api/v1/my/orders/{$order->invoice_id}");

        $response->assertOk()
            ->assertJsonPath('ok', true);
        $response->assertJsonPath('order.invoiceId', $order->invoice_id);
        $this->assertCount(1, $response->json('order.items'));
        $this->assertEquals('منتج اختبار', $response->json('order.items.0.name'));
    }

    public function test_cannot_view_others_order()
    {
        $otherCustomer = Customer::factory()->create();
        $order = Order::factory()->for($otherCustomer)->create();

        $response = $this->withToken($this->token)
            ->getJson("/api/v1/my/orders/{$order->invoice_id}");

        $response->assertNotFound();
    }

    public function test_cannot_view_nonexistent_order()
    {
        $response = $this->withToken($this->token)
            ->getJson('/api/v1/my/orders/INV-NONEXISTENT');

        $response->assertNotFound();
    }

    public function test_unauthenticated_cannot_access_orders()
    {
        $response = $this->getJson('/api/v1/my/orders');

        $response->assertUnauthorized();
    }

    public function test_unauthenticated_cannot_access_single_order()
    {
        $response = $this->getJson('/api/v1/my/orders/INV-123');

        $response->assertUnauthorized();
    }

    public function test_status_labels_are_correct()
    {
        $statuses = ['pending' => 'قيد الانتظار', 'confirmed' => 'مؤكد', 'processing' => 'قيد التجهيز',
            'shipped' => 'تم الشحن', 'delivered' => 'تم التسليم', 'cancelled' => 'ملغى'];

        foreach ($statuses as $status => $label) {
            $order = Order::factory()->for($this->customer)->create(['status' => $status]);

            $response = $this->withToken($this->token)
                ->getJson("/api/v1/my/orders/{$order->invoice_id}");

            $response->assertOk();
            $this->assertEquals($label, $response->json('order.statusLabel'));
        }
    }
}
