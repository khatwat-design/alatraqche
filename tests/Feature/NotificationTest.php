<?php

namespace Tests\Feature;

use App\Mail\OrderStatusUpdated;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Services\OrderNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_status_change_sends_notification(): void
    {
        Mail::fake();

        $customer = Customer::factory()->create([
            'email' => 'customer@test.com',
            'phone' => '07712345678',
        ]);

        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create(['stock_qty' => 10]);

        $order = Order::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'pending',
        ]);

        $order->update(['status' => 'confirmed']);

        Mail::assertQueued(OrderStatusUpdated::class, function ($mail) use ($order, $customer) {
            return $mail->order->id === $order->id
                && $mail->hasTo($customer->email);
        });
    }

    public function test_notification_not_sent_without_email(): void
    {
        Mail::fake();

        $customer = Customer::factory()->create([
            'email' => null,
            'phone' => '07712345678',
        ]);

        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create(['stock_qty' => 10]);

        $order = Order::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'pending',
        ]);

        OrderNotificationService::notify($order);

        Mail::assertNothingQueued();
    }

    public function test_order_status_change_notification_has_correct_subject(): void
    {
        Mail::fake();

        $customer = Customer::factory()->create(['email' => 'customer@test.com']);
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create(['stock_qty' => 10]);

        $order = Order::factory()->create([
            'customer_id' => $customer->id,
        ]);

        $mailable = new OrderStatusUpdated($order);
        $mailable->assertHasSubject('تحديث حالة الطلب #'.$order->invoice_id);
    }

    public function test_notification_not_sent_on_initial_create(): void
    {
        Mail::fake();

        $customer = Customer::factory()->create([
            'email' => 'customer@test.com',
            'phone' => '07712345678',
        ]);

        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create(['stock_qty' => 10]);

        $order = Order::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'pending',
        ]);

        Mail::assertNothingQueued();
    }
}
