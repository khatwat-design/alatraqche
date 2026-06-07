<?php

namespace Database\Factories;

use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        $unitPrice = fake()->numberBetween(10000, 250000);
        $quantity = fake()->numberBetween(1, 5);

        return [
            'order_id' => \App\Models\Order::factory(),
            'product_id' => \App\Models\Product::factory(),
            'name' => fake()->words(3, true),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $unitPrice * $quantity,
        ];
    }
}
