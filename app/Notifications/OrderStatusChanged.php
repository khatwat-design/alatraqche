<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderStatusChanged extends Notification
{
    use Queueable;

    public function __construct(
        public Order $order,
        public string $oldStatus,
        public string $newStatus
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
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'type' => 'order_status_changed',
            'message' => 'تم تحديث الطلب #' . $this->order->invoice_id . ' إلى ' . $this->newStatus,
        ];
    }
}
