<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\OrderNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendOrderNotificationJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Order $order
    ) {}

    public function handle(): void
    {
        OrderNotificationService::notify($this->order);
    }
}
