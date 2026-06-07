<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProductTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private string $token;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->token = $this->admin->createToken('admin')->plainTextToken;
        $this->category = Category::factory()->create();
    }

    public function test_index_returns_paginated_products()
    {
        Product::factory()->for($this->category)->count(5)->create();

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/products');

        $response->assertOk();
        $response->assertJsonStructure([
            'products' => [],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
        $this->assertCount(5, $response->json('products'));
    }

    public function test_show_returns_product()
    {
        $product = Product::factory()->for($this->category)->create();

        $response = $this->withToken($this->token)
            ->getJson("/api/v1/admin/products/{$product->id}");

        $response->assertOk();
        $response->assertJsonPath('id', $product->id);
        $response->assertJsonPath('name', $product->name);
    }

    public function test_show_returns_404_for_nonexistent_product()
    {
        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/products/nonexistent-id');

        $response->assertNotFound()
            ->assertJsonPath('message', 'المنتج غير موجود.');
    }

    public function test_store_creates_product()
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/v1/admin/products', [
                'name' => 'منتج جديد',
                'price' => 50000,
                'stock' => 10,
                'category_id' => $this->category->id,
            ]);

        $response->assertCreated()
            ->assertJsonPath('ok', true);

        $this->assertDatabaseHas('products', [
            'name' => 'منتج جديد',
            'price' => 50000,
            'stock_qty' => 10,
            'category_id' => $this->category->id,
        ]);
    }

    public function test_store_validates_required_fields()
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/v1/admin/products', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'price']);
    }

    public function test_update_modifies_product()
    {
        $product = Product::factory()->for($this->category)->create([
            'name' => 'اسم قديم',
            'price' => 10000,
            'stock_qty' => 5,
            'is_visible' => true,
        ]);

        $response = $this->withToken($this->token)
            ->putJson("/api/v1/admin/products/{$product->id}", [
                'name' => 'اسم جديد',
                'price' => 25000,
                'stock' => 20,
                'is_active' => false,
            ]);

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('message', 'تم تحديث المنتج بنجاح');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'اسم جديد',
            'price' => 25000,
            'stock_qty' => 20,
            'is_visible' => false,
        ]);
    }

    public function test_update_returns_404_for_nonexistent_product()
    {
        $response = $this->withToken($this->token)
            ->putJson('/api/v1/admin/products/nonexistent-id', [
                'name' => 'اسم',
                'price' => 1000,
            ]);

        $response->assertNotFound()
            ->assertJsonPath('message', 'المنتج غير موجود.');
    }

    public function test_destroy_deletes_product()
    {
        $product = Product::factory()->for($this->category)->create();

        $response = $this->withToken($this->token)
            ->deleteJson("/api/v1/admin/products/{$product->id}");

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('message', 'تم حذف المنتج بنجاح');

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_destroy_returns_404_for_nonexistent_product()
    {
        $response = $this->withToken($this->token)
            ->deleteJson('/api/v1/admin/products/nonexistent-id');

        $response->assertNotFound()
            ->assertJsonPath('message', 'المنتج غير موجود.');
    }

    public function test_non_admin_cannot_manage_products()
    {
        $user = User::factory()->create(['is_admin' => false]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/v1/admin/products');

        $response->assertForbidden();
    }
}
