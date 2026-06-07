<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Category;
use App\Models\Product;
use App\Services\CouponService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponTest extends TestCase
{
    use RefreshDatabase;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $category = Category::factory()->create();
        $this->product = Product::factory()->for($category)->create([
            'stock_qty' => 10,
            'price' => 50000,
        ]);
    }

    public function test_coupon_is_valid(): void
    {
        $coupon = Coupon::create([
            'code' => 'SAVE10',
            'type' => 'fixed',
            'value' => 10000,
            'is_active' => true,
        ]);

        $this->assertTrue($coupon->isValid());
    }

    public function test_coupon_is_invalid_when_expired(): void
    {
        $coupon = Coupon::create([
            'code' => 'EXPIRED',
            'type' => 'percentage',
            'value' => 10,
            'is_active' => true,
            'expires_at' => Carbon::yesterday(),
        ]);

        $this->assertFalse($coupon->isValid());
    }

    public function test_coupon_is_invalid_when_inactive(): void
    {
        $coupon = Coupon::create([
            'code' => 'INACTIVE',
            'type' => 'fixed',
            'value' => 5000,
            'is_active' => false,
        ]);

        $this->assertFalse($coupon->isValid());
    }

    public function test_coupon_is_invalid_when_usage_exceeded(): void
    {
        $coupon = Coupon::create([
            'code' => 'LIMITED',
            'type' => 'fixed',
            'value' => 5000,
            'is_active' => true,
            'usage_limit' => 5,
        ]);
        $coupon->used_count = 5;

        $this->assertFalse($coupon->isValid());
    }

    public function test_fixed_coupon_discount(): void
    {
        $coupon = Coupon::create([
            'code' => 'FIXED50',
            'type' => 'fixed',
            'value' => 5000,
        ]);

        $this->assertEquals(5000, $coupon->calculateDiscount(100000));
    }

    public function test_percentage_coupon_discount(): void
    {
        $coupon = Coupon::create([
            'code' => 'PCT10',
            'type' => 'percentage',
            'value' => 10,
        ]);

        $this->assertEquals(10000, $coupon->calculateDiscount(100000));
    }

    public function test_percentage_discount_respects_max(): void
    {
        $coupon = Coupon::create([
            'code' => 'PCT50MAX',
            'type' => 'percentage',
            'value' => 50,
            'max_discount' => 20000,
        ]);

        $this->assertEquals(20000, $coupon->calculateDiscount(100000));
    }

    public function test_coupon_min_order_amount(): void
    {
        $coupon = Coupon::create([
            'code' => 'MINORDER',
            'type' => 'fixed',
            'value' => 5000,
            'min_order_amount' => 200000,
        ]);

        $this->assertEquals(0, $coupon->calculateDiscount(50000));
        $this->assertEquals(5000, $coupon->calculateDiscount(200000));
    }

    public function test_coupon_service_validates_and_returns_coupon(): void
    {
        $coupon = Coupon::create([
            'code' => 'VALID',
            'type' => 'fixed',
            'value' => 5000,
            'is_active' => true,
        ]);

        $result = CouponService::validate('VALID', 100000);
        $this->assertNotNull($result);
        $this->assertEquals($coupon->id, $result->id);
    }

    public function test_coupon_service_returns_null_for_invalid(): void
    {
        $result = CouponService::validate('NONEXISTENT', 100000);
        $this->assertNull($result);
    }

    public function test_order_with_valid_coupon(): void
    {
        Coupon::create([
            'code' => 'WELCOME',
            'type' => 'fixed',
            'value' => 5000,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/orders', [
            'customer' => [
                'name' => 'أحمد',
                'phone' => '07712345678',
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
            'coupon' => 'WELCOME',
            'channel' => 'web',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('orders', [
            'invoice_id' => $response->json('invoiceId'),
            'discount' => 5000,
            'total' => 100000,
        ]);
    }

    public function test_order_with_invalid_coupon_returns_error(): void
    {
        $response = $this->postJson('/api/v1/orders', [
            'customer' => [
                'name' => 'أحمد',
                'phone' => '07712345678',
            ],
            'items' => [
                [
                    'id' => $this->product->id,
                    'name' => $this->product->name,
                    'price' => 50000,
                    'quantity' => 1,
                    'subtotal' => 50000,
                ],
            ],
            'summary' => [
                'subtotal' => 50000,
                'deliveryFee' => 0,
                'total' => 50000,
                'totalItems' => 1,
            ],
            'coupon' => 'INVALIDCODE',
            'channel' => 'web',
        ]);

        $response->assertStatus(422);
    }

    public function test_coupon_usage_increments(): void
    {
        $coupon = Coupon::create([
            'code' => 'USAGE',
            'type' => 'fixed',
            'value' => 1000,
            'is_active' => true,
        ]);

        CouponService::apply($coupon);
        $coupon->refresh();

        $this->assertEquals(1, $coupon->used_count);
    }
}
