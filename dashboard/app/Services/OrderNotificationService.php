<?php

declare(strict_types=1);

namespace App\Services;

use App\Mail\OrderStatusUpdated;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

final class OrderNotificationService
{
    public static function notify(Order $order): void
    {
        $order->loadMissing('customer');

        $email = $order->customer?->email;

        if (empty($email)) {
            return;
        }

        try {
            Mail::to($email)->queue(new OrderStatusUpdated($order));
        } catch (\Throwable $e) {
            Log::error('فشل إرسال إشعار الطلب', [
                'order' => $order->invoice_id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
