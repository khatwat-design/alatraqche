<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductOptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_storefront_product_includes_options(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create(['is_visible' => true]);

        $color = ProductOption::create(['name' => 'اللون', 'slug' => 'color', 'type' => 'select']);
        $size = ProductOption::create(['name' => 'المقاس', 'slug' => 'size', 'type' => 'select']);

        ProductOptionValue::create(['product_option_id' => $color->id, 'value' => 'أحمر', 'price_adjustment' => 0, 'sort_order' => 1]);
        ProductOptionValue::create(['product_option_id' => $color->id, 'value' => 'أزرق', 'price_adjustment' => 5000, 'sort_order' => 2]);
        ProductOptionValue::create(['product_option_id' => $size->id, 'value' => 'كبير', 'price_adjustment' => 10000, 'sort_order' => 1]);
        ProductOptionValue::create(['product_option_id' => $size->id, 'value' => 'صغير', 'price_adjustment' => 0, 'sort_order' => 2]);

        $product->options()->attach([$color->id, $size->id]);

        $response = $this->getJson("/api/v1/products/{$product->id}");

        $response->assertOk();
        $productData = $response->json('product');

        $this->assertArrayHasKey('options', $productData);
        $this->assertCount(2, $productData['options']);

        $colorData = collect($productData['options'])->firstWhere('slug', 'color');
        $this->assertNotNull($colorData);
        $this->assertCount(2, $colorData['values']);

        $sizeData = collect($productData['options'])->firstWhere('slug', 'size');
        $this->assertNotNull($sizeData);
        $this->assertCount(2, $sizeData['values']);
    }

    public function test_storefront_products_list_includes_options(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create(['is_visible' => true]);

        $option = ProductOption::create(['name' => 'اللون', 'slug' => 'color', 'type' => 'select']);
        $value = ProductOptionValue::create(['product_option_id' => $option->id, 'value' => 'أحمر', 'price_adjustment' => 0, 'sort_order' => 1]);

        $product->options()->attach($option->id);

        $response = $this->getJson('/api/v1/products');

        $response->assertOk();
        $products = $response->json('products');
        $this->assertCount(1, $products);
        $this->assertArrayHasKey('options', $products[0]);
        $this->assertCount(1, $products[0]['options']);
    }

    public function test_order_with_product_options(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create([
            'stock_qty' => 10,
            'price' => 50000,
            'is_visible' => true,
        ]);

        $option = ProductOption::create(['name' => 'اللون', 'slug' => 'color', 'type' => 'select']);
        $value = ProductOptionValue::create([
            'product_option_id' => $option->id,
            'value' => 'أحمر',
            'price_adjustment' => 0,
            'sort_order' => 1,
        ]);
        $product->options()->attach($option->id);

        $response = $this->postJson('/api/v1/orders', [
            'customer' => [
                'name' => 'أحمد',
                'phone' => '07712345678',
            ],
            'items' => [
                [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => 50000,
                    'quantity' => 1,
                    'subtotal' => 50000,
                    'options' => [
                        [
                            'optionId' => $option->id,
                            'valueId' => $value->id,
                            'value' => 'أحمر',
                        ],
                    ],
                ],
            ],
            'summary' => [
                'subtotal' => 50000,
                'deliveryFee' => 0,
                'total' => 50000,
                'totalItems' => 1,
            ],
            'channel' => 'web',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $items = \App\Models\OrderItem::where('order_id', $response->json('orderId'))->get();
        $this->assertCount(1, $items);
        $this->assertEquals([
            ['optionId' => $option->id, 'valueId' => $value->id, 'value' => 'أحمر'],
        ], $items[0]->options);
    }

    public function test_option_values_are_sorted_by_sort_order(): void
    {
        $option = ProductOption::create(['name' => 'المقاس', 'slug' => 'size', 'type' => 'select']);

        ProductOptionValue::create(['product_option_id' => $option->id, 'value' => 'كبير', 'price_adjustment' => 0, 'sort_order' => 2]);
        ProductOptionValue::create(['product_option_id' => $option->id, 'value' => 'صغير', 'price_adjustment' => 0, 'sort_order' => 1]);
        ProductOptionValue::create(['product_option_id' => $option->id, 'value' => 'وسط', 'price_adjustment' => 0, 'sort_order' => 3]);

        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create(['is_visible' => true]);
        $product->options()->attach($option->id);

        $response = $this->getJson("/api/v1/products/{$product->id}");

        $response->assertOk();
        $options = $response->json('product.options');
        $values = $options[0]['values'];

        $this->assertEquals('صغير', $values[0]['value']);
        $this->assertEquals('كبير', $values[1]['value']);
        $this->assertEquals('وسط', $values[2]['value']);
    }
}
