<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = fake()->numberBetween(50000, 1000000);
        $deliveryFee = fake()->numberBetween(0, 25000);
        $totalItems = fake()->numberBetween(1, 10);

        return [
            'invoice_id' => 'INV-' . strtoupper(fake()->bothify('??####')),
            'customer_id' => Customer::factory(),
            'status' => fake()->randomElement(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
            'customer_name' => fake()->name(),
            'customer_phone' => '077' . fake()->numerify('#######'),
            'customer_city' => fake()->randomElement(['بغداد', 'البصرة', 'أربيل', 'الموصل', 'كركوك']),
            'customer_address' => fake()->address(),
            'floor_note' => fake()->optional()->sentence(),
            'delivery_time_note' => fake()->optional()->sentence(),
            'notes' => fake()->optional()->sentence(),
            'payment_method' => 'cod',
            'subtotal' => $subtotal,
            'delivery_fee' => $deliveryFee,
            'total' => $subtotal + $deliveryFee,
            'discount' => 0,
            'total_items' => $totalItems,
            'coupon_id' => null,
            'channel' => 'web',
            'payload' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'pending']);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'cancelled']);
    }
}
