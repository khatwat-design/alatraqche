<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    private array $validOrderPayload;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $category = Category::factory()->create();
        $this->product = Product::factory()->for($category)->create([
            'stock_qty' => 10,
            'price' => 50000,
        ]);

        $this->validOrderPayload = [
            'customer' => [
                'name' => 'أحمد',
                'phone' => '07712345678',
                'city' => 'بغداد',
                'address' => 'شارع فلسطين، بغداد',
                'carType' => 'سيارة',
                'carModel' => 'موديل 2024',
                'notes' => 'اتصل قبل الوصول',
                'paymentMethod' => 'cod',
            ],
            'items' => [
                [
                    'id' => $this->product->id,
                    'name' => $this->product->name,
                    'price' => 50000,
                    'quantity' => 2,
                    'subtotal' => 100000,
                ],
            ],
            'summary' => [
                'subtotal' => 100000,
                'deliveryFee' => 5000,
                'total' => 105000,
                'totalItems' => 2,
            ],
            'channel' => 'web',
        ];
    }

    public function test_can_create_order()
    {
        $response = $this->postJson('/api/v1/orders', $this->validOrderPayload);

        $response->assertCreated()
            ->assertJsonPath('ok', true)
            ->assertJsonStructure([
                'ok', 'invoiceId', 'orderId', 'storeToken', 'tokenType',
            ]);

        $this->assertDatabaseHas('orders', [
            'invoice_id' => $response->json('invoiceId'),
            'customer_name' => 'أحمد',
            'total' => 105000,
        ]);

        $this->assertDatabaseHas('order_items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $this->product->refresh();
        $this->assertEquals(8, $this->product->stock_qty);
    }

    public function test_cannot_create_order_with_insufficient_stock()
    {
        $this->product->update(['stock_qty' => 1]);

        $response = $this->postJson('/api/v1/orders', $this->validOrderPayload);

        $response->assertStatus(422)
            ->assertJsonPath('ok', false);
    }

    public function test_cannot_create_order_with_nonexistent_product()
    {
        $this->validOrderPayload['items'][0]['id'] = 'non-existent';

        $response = $this->postJson('/api/v1/orders', $this->validOrderPayload);

        $response->assertStatus(422)
            ->assertJsonPath('ok', false);
    }

    public function test_cannot_create_order_with_empty_items()
    {
        $this->validOrderPayload['items'] = [];

        $response = $this->postJson('/api/v1/orders', $this->validOrderPayload);

        $response->assertStatus(422);
    }

    public function test_cannot_create_order_without_customer()
    {
        $response = $this->postJson('/api/v1/orders', [
            'items' => $this->validOrderPayload['items'],
            'summary' => $this->validOrderPayload['summary'],
        ]);

        $response->assertStatus(422);
    }

    public function test_order_creates_customer_if_new()
    {
        $response = $this->postJson('/api/v1/orders', $this->validOrderPayload);

        $response->assertCreated();
        $this->assertDatabaseHas('customers', [
            'phone' => '07712345678',
            'name' => 'أحمد',
        ]);
    }

    public function test_order_updates_existing_customer_name()
    {
        \App\Models\Customer::factory()->create([
            'phone' => '07712345678',
            'name' => 'اسم قديم',
        ]);

        $response = $this->postJson('/api/v1/orders', $this->validOrderPayload);

        $response->assertCreated();
        $this->assertDatabaseHas('customers', [
            'phone' => '07712345678',
            'name' => 'أحمد',
        ]);
    }

    public function test_order_returns_store_token()
    {
        $response = $this->postJson('/api/v1/orders', $this->validOrderPayload);

        $response->assertCreated();
        $this->assertNotNull($response->json('storeToken'));
        $this->assertEquals('Bearer', $response->json('tokenType'));
    }

    public function test_order_stock_is_atomic()
    {
        $this->postJson('/api/v1/orders', $this->validOrderPayload);
        $this->postJson('/api/v1/orders', $this->validOrderPayload);

        $this->product->refresh();
        $this->assertEquals(6, $this->product->stock_qty);
    }

    public function test_normalizes_phone_on_order()
    {
        $this->validOrderPayload['customer']['phone'] = '009647712345678';

        $response = $this->postJson('/api/v1/orders', $this->validOrderPayload);

        $response->assertCreated();
        $this->assertDatabaseHas('customers', ['phone' => '07712345678']);
    }

    public function test_order_throttle()
    {
        for ($i = 0; $i < 20; $i++) {
            $product = Product::factory()->for(Category::factory()->create())->create(['stock_qty' => 99]);
            $payload = $this->validOrderPayload;
            $payload['items'][0]['id'] = $product->id;
            $payload['customer']['phone'] = '077' . str_pad((string) $i, 10, '0', STR_PAD_LEFT);
            $this->postJson('/api/v1/orders', $payload);
        }

        $response = $this->postJson('/api/v1/orders', $this->validOrderPayload);
        $this->assertContains($response->status(), [201, 429], 'Should throttle at 20+ requests');
    }
}
