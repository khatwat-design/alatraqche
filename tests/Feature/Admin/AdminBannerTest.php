<?php

namespace Tests\Feature\Admin;

use App\Models\Banner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminBannerTest extends TestCase
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

    public function test_index_returns_paginated_banners()
    {
        Banner::factory()->count(5)->create();

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/banners');

        $response->assertOk();
        $response->assertJsonStructure([
            'banners' => [],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
        $this->assertCount(5, $response->json('banners'));
    }

    public function test_show_returns_banner()
    {
        $banner = Banner::factory()->create();

        $response = $this->withToken($this->token)
            ->getJson("/api/v1/admin/banners/{$banner->id}");

        $response->assertOk();
        $response->assertJsonPath('id', $banner->id);
        $response->assertJsonPath('title', $banner->title);
    }

    public function test_show_returns_404_for_nonexistent_banner()
    {
        $response = $this->withToken($this->token)
            ->getJson('/api/v1/admin/banners/99999');

        $response->assertNotFound()
            ->assertJsonPath('message', 'البانر غير موجود.');
    }

    public function test_store_creates_banner()
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/v1/admin/banners', [
                'title' => 'بانر جديد',
                'link_url' => 'https://example.com',
                'sort_order' => 1,
                'is_active' => true,
            ]);

        $response->assertCreated()
            ->assertJsonPath('ok', true);

        $this->assertDatabaseHas('banners', [
            'title' => 'بانر جديد',
            'link_url' => 'https://example.com',
            'sort_order' => 1,
            'is_active' => true,
        ]);
    }

    public function test_store_validates_required_fields()
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/v1/admin/banners', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    public function test_update_modifies_banner()
    {
        $banner = Banner::factory()->create([
            'title' => 'عنوان قديم',
            'is_active' => true,
        ]);

        $response = $this->withToken($this->token)
            ->putJson("/api/v1/admin/banners/{$banner->id}", [
                'title' => 'عنوان جديد',
                'is_active' => false,
            ]);

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('message', 'تم تحديث البانر بنجاح');

        $this->assertDatabaseHas('banners', [
            'id' => $banner->id,
            'title' => 'عنوان جديد',
            'is_active' => false,
        ]);
    }

    public function test_destroy_deletes_banner()
    {
        $banner = Banner::factory()->create();

        $response = $this->withToken($this->token)
            ->deleteJson("/api/v1/admin/banners/{$banner->id}");

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('message', 'تم حذف البانر بنجاح');

        $this->assertDatabaseMissing('banners', ['id' => $banner->id]);
    }

    public function test_destroy_returns_404_for_nonexistent_banner()
    {
        $response = $this->withToken($this->token)
            ->deleteJson('/api/v1/admin/banners/99999');

        $response->assertNotFound()
            ->assertJsonPath('message', 'البانر غير موجود.');
    }
}
