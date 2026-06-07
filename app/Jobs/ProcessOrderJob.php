<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\OrderNotificationService;
use App\Services\WebhookService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessOrderJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Order $order,
        public string $action = 'created'
    ) {}

    public function handle(): void
    {
        if ($this->action === 'created') {
            WebhookService::dispatch($this->order, 'order.created');
        }
    }
}
