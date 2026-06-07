<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use App\Models\Webhook;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class WebhookService
{
    public static function dispatch(Order $order, string $event): void
    {
        $hooks = Webhook::query()
            ->where('is_active', true)
            ->get()
            ->filter(fn (Webhook $h) => in_array('*', $h->events ?? []) || in_array($event, $h->events ?? []));

        if ($hooks->isEmpty()) {
            return;
        }

        $order->loadMissing('items');

        $payload = [
            'event' => $event,
            'data' => [
                'id' => $order->id,
                'invoice_id' => $order->invoice_id,
                'status' => $order->status,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'total' => $order->total,
                'items_count' => $order->total_items,
                'created_at' => $order->created_at?->toIso8601String(),
                'updated_at' => $order->updated_at?->toIso8601String(),
            ],
        ];

        foreach ($hooks as $hook) {
            try {
                $response = Http::timeout(5)
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'X-Webhook-Secret' => $hook->secret ?? '',
                        'X-Event-Name' => $event,
                    ])
                    ->post($hook->url, $payload);

                if (! $response->successful()) {
                    Log::warning('Webhook failed', [
                        'url' => $hook->url,
                        'event' => $event,
                        'status' => $response->status(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('Webhook error', [
                    'url' => $hook->url,
                    'event' => $event,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
