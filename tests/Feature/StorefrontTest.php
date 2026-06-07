<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use App\Models\StoreSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StorefrontTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_settings_returns_all_fields()
    {
        StoreSetting::current();

        $response = $this->getJson('/api/v1/store');

        $response->assertOk()
            ->assertJsonStructure([
                'storeName',
                'sloganLine1',
                'sloganLine2',
                'sloganHighlightPhrase',
                'metaTitle',
                'headerBackground',
                'footerBackground',
                'primaryColor',
                'logoUrl',
                'addressLine',
                'mapLat',
                'mapLng',
                'mapEmbedUrl',
                'phones',
                'instagramUrl',
                'facebookUrl',
                'tiktokUrl',
                'metaPixelId',
                'tiktokPixelId',
                'googleAnalyticsId',
                'snapchatPixelId',
                'twitterPixelId',
                'customHeadSnippet',
            ]);

        $response->assertJsonFragment([
            'storeName' => 'الأطرقجي للسجاد والأثاث والمفروشات',
        ]);
    }

    public function test_categories_returns_all_sorted()
    {
        Category::factory()->create(['sort_order' => 2, 'name' => 'ب']);
        Category::factory()->create(['sort_order' => 1, 'name' => 'أ']);

        $response = $this->getJson('/api/v1/categories');

        $response->assertOk();
        $data = $response->json();
        $this->assertCount(2, $data);
        $this->assertEquals('أ', $data[0]['name']);
        $this->assertEquals('ب', $data[1]['name']);
    }

    public function test_products_returns_only_visible()
    {
        $category = Category::factory()->create();
        Product::factory()->for($category)->create(['is_visible' => true, 'name' => 'Visible']);
        Product::factory()->for($category)->create(['is_visible' => false, 'name' => 'Hidden']);

        $response = $this->getJson('/api/v1/products');

        $response->assertOk();
        $products = $response->json('products');
        $this->assertCount(1, $products);
        $this->assertEquals('Visible', $products[0]['name']);
    }

    public function test_products_returns_empty_when_none_visible()
    {
        $response = $this->getJson('/api/v1/products');

        $response->assertOk();
        $this->assertCount(0, $response->json('products'));
    }

    public function test_single_product_returns_visible()
    {
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create(['is_visible' => true]);

        $response = $this->getJson("/api/v1/products/{$product->id}");

        $response->assertOk();
        $response->assertJsonPath('product.id', $product->id);
    }

    public function test_single_product_returns_404_for_invisible()
    {
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create(['is_visible' => false]);

        $response = $this->getJson("/api/v1/products/{$product->id}");

        $response->assertNotFound();
    }

    public function test_single_product_returns_404_for_nonexistent()
    {
        $response = $this->getJson('/api/v1/products/non-existent');

        $response->assertNotFound();
    }

    public function test_banners_returns_only_active()
    {
        Banner::factory()->create(['is_active' => true, 'sort_order' => 1]);
        Banner::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/v1/banners');

        $response->assertOk();
        $this->assertCount(1, $response->json());
    }

    public function test_public_endpoints_have_no_auth()
    {
        $this->getJson('/api/v1/store')->assertOk();
        $this->getJson('/api/v1/categories')->assertOk();
        $this->getJson('/api/v1/products')->assertOk();
        $this->getJson('/api/v1/banners')->assertOk();
    }

    public function test_products_search_by_name()
    {
        $category = Category::factory()->create();
        Product::factory()->for($category)->create(['name' => 'سجادة كبيرة', 'is_visible' => true]);
        Product::factory()->for($category)->create(['name' => 'وسادة نوم', 'is_visible' => true]);

        $response = $this->getJson('/api/v1/products?search=سجادة');

        $response->assertOk();
        $this->assertCount(1, $response->json('products'));
        $this->assertEquals('سجادة كبيرة', $response->json('products.0.name'));
    }

    public function test_products_search_by_description()
    {
        $category = Category::factory()->create();
        Product::factory()->for($category)->create([
            'name' => 'Product A',
            'description' => 'This is a special premium product',
            'is_visible' => true,
        ]);
        Product::factory()->for($category)->create([
            'name' => 'Product B',
            'description' => 'Something else entirely',
            'is_visible' => true,
        ]);

        $response = $this->getJson('/api/v1/products?search=premium');

        $response->assertOk();
        $this->assertCount(1, $response->json('products'));
    }

    public function test_products_filter_by_category()
    {
        $cat1 = Category::factory()->create();
        $cat2 = Category::factory()->create();
        Product::factory()->for($cat1)->create(['is_visible' => true]);
        Product::factory()->for($cat1)->create(['is_visible' => true]);
        Product::factory()->for($cat2)->create(['is_visible' => true]);

        $response = $this->getJson('/api/v1/products?category='.$cat1->id);

        $response->assertOk();
        $this->assertCount(2, $response->json('products'));
    }

    public function test_products_pagination()
    {
        $category = Category::factory()->create();
        Product::factory()->for($category)->count(60)->create(['is_visible' => true]);

        $response = $this->getJson('/api/v1/products?per_page=20');

        $response->assertOk();
        $this->assertCount(20, $response->json('products'));
        $this->assertEquals(20, $response->json('meta.per_page'));
        $this->assertEquals(3, $response->json('meta.last_page'));
        $this->assertEquals(60, $response->json('meta.total'));
    }

    public function test_products_pagination_defaults_to_50()
    {
        $category = Category::factory()->create();
        Product::factory()->for($category)->count(70)->create(['is_visible' => true]);

        $response = $this->getJson('/api/v1/products');

        $response->assertOk();
        $this->assertCount(50, $response->json('products'));
        $this->assertEquals(50, $response->json('meta.per_page'));
    }
}
