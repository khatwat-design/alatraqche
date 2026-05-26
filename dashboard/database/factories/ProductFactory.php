<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'id' => fake()->unique()->slug(1),
            'category_id' => \App\Models\Category::factory(),
            'name' => fake()->unique()->words(3, true),
            'description' => fake()->paragraph(),
            'price' => fake()->numberBetween(10000, 500000),
            'badge' => fake()->optional()->randomElement(['جديد', 'تخفيض', 'مميز']),
            'image' => '/products/' . fake()->uuid() . '.jpg',
            'stock_qty' => fake()->numberBetween(0, 100),
            'is_visible' => true,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }

    public function invisible(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_visible' => false,
        ]);
    }

    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_qty' => 0,
        ]);
    }
}
