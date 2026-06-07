<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'id' => fake()->unique()->slug(1),
            'name' => fake()->unique()->word(),
            'description' => fake()->sentence(),
            'image' => null,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
