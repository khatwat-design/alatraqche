<?php

namespace Tests\Feature\Admin;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use App\Models\StoreSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
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

    public function test_dashboard_returns_stats()
    {
        $category = Category::factory()->create();
        Product::factory()->for($category)->count(3)->create();
        Customer::factory()->count(2)->create();
        Order::factory()->count(4)->create();

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/dashboard');

        $response->assertOk();
        $response->assertJsonStructure([
            'revenue' => ['current', 'previous'],
            'orders' => ['current', 'previous'],
            'products' => ['current', 'previous'],
            'customers' => ['current', 'previous'],
        ]);
    }

    public function test_analytics_returns_data()
    {
        $category = Category::factory()->create();
        Product::factory()->for($category)->count(3)->create();
        Customer::factory()->count(2)->create();
        Order::factory()->count(4)->create();

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/analytics');

        $response->assertOk();
        $response->assertJsonStructure([
            'total_revenue',
            'average_order',
            'total_orders',
            'total_customers',
            'monthly_revenue',
            'daily_orders',
            'status_distribution',
            'cancellation_rate',
        ]);
        $this->assertEquals(4, $response->json('total_orders'));
        $this->assertEquals(6, $response->json('total_customers'));
    }

    public function test_can_get_store_settings()
    {
        StoreSetting::current();

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/store');

        $response->assertOk()
            ->assertJsonStructure([
                'store_name',
                'store_description',
                'store_phone',
                'store_email',
                'store_address',
                'delivery_fee',
                'free_delivery_threshold',
                'currency',
            ]);
    }

    public function test_can_update_store_settings()
    {
        $response = $this->withToken($this->token)
            ->putJson('/api/v1/admin/store', [
                'store_name' => 'متجري الجديد',
                'store_description' => 'وصف المتجر',
                'store_phone' => '07711111111',
                'store_email' => 'store@example.com',
                'store_address' => 'عنوان المتجر',
                'delivery_fee' => 5000,
            ]);

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('message', 'تم حفظ الإعدادات بنجاح');

        $setting = StoreSetting::current();
        $this->assertEquals('متجري الجديد', $setting->store_name);
        $this->assertEquals('وصف المتجر', $setting->slogan_line2);
        $this->assertEquals('07711111111', $setting->phone_primary);
        $this->assertEquals('store@example.com', $setting->meta_title);
        $this->assertEquals('عنوان المتجر', $setting->address_line);
        $this->assertEquals(5000, $setting->delivery_fee);
    }
}
