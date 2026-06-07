<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\WebhookService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class DispatchWebhookJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Order $order,
        public string $event
    ) {}

    public function handle(): void
    {
        WebhookService::dispatch($this->order, $this->event);
    }
}
