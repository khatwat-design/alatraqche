<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCreated extends Notification
{
    use Queueable;

    public function __construct(
        public Order $order
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'invoice_id' => $this->order->invoice_id,
            'customer_name' => $this->order->customer_name,
            'total' => $this->order->total,
            'type' => 'order_created',
            'message' => 'طلب جديد #' . $this->order->invoice_id,
        ];
    }
}
