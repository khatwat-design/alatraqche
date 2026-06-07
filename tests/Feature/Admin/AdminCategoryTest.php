<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Category;

class AdminCategoryTest extends TestCase
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

    public function test_index_returns_categories()
    {
        Category::factory()->count(3)->create();

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/categories');

        $response->assertOk();
        $response->assertJsonStructure([
            'categories' => [],
        ]);
        $this->assertCount(3, $response->json('categories'));
    }

    public function test_show_returns_category()
    {
        $category = Category::factory()->create();

        $response = $this->withToken($this->token)
            ->getJson("/api/v1/admin/categories/{$category->id}");

        $response->assertOk();
        $response->assertJsonPath('id', $category->id);
        $response->assertJsonPath('name', $category->name);
    }

    public function test_show_returns_404_for_nonexistent_category()
    {
        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/categories/99999');

        $response->assertNotFound()
            ->assertJsonPath('message', 'التصنيف غير موجود.');
    }

    public function test_store_creates_category()
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/v1/admin/categories', [
                'name' => 'تصنيف جديد',
                'description' => 'وصف التصنيف',
            ]);

        $response->assertCreated()
            ->assertJsonPath('ok', true);

        $this->assertDatabaseHas('categories', [
            'name' => 'تصنيف جديد',
            'description' => 'وصف التصنيف',
        ]);
    }

    public function test_store_validates_required_fields()
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/v1/admin/categories', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_update_modifies_category()
    {
        $category = Category::factory()->create([
            'name' => 'اسم قديم',
        ]);

        $response = $this->withToken($this->token)
            ->putJson("/api/v1/admin/categories/{$category->id}", [
                'name' => 'اسم جديد',
            ]);

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('message', 'تم تحديث التصنيف بنجاح');

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'اسم جديد',
        ]);
    }

    public function test_destroy_deletes_category()
    {
        $category = Category::factory()->create();

        $response = $this->withToken($this->token)
            ->deleteJson("/api/v1/admin/categories/{$category->id}");

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('message', 'تم حذف التصنيف بنجاح');

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_destroy_returns_404_for_nonexistent_category()
    {
        $response = $this->withToken($this->token)
            ->deleteJson('/api/v1/admin/categories/99999');

        $response->assertNotFound()
            ->assertJsonPath('message', 'التصنيف غير موجود.');
    }

    public function test_non_admin_cannot_manage_categories()
    {
        $user = User::factory()->create(['is_admin' => false]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/v1/admin/categories');

        $response->assertForbidden();
    }
}
