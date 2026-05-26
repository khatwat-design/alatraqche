<?php

namespace App\Models;

use App\Services\OrderNotificationService;
use App\Services\WebhookService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'customer_id',
        'status',
        'customer_name',
        'customer_phone',
        'customer_city',
        'customer_address',
        'floor_note',
        'delivery_time_note',
        'notes',
        'payment_method',
        'subtotal',
        'delivery_fee',
        'total',
        'discount',
        'total_items',
        'coupon_id',
        'channel',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'integer',
            'delivery_fee' => 'integer',
            'total' => 'integer',
            'discount' => 'integer',
            'total_items' => 'integer',
            'payload' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::updated(function (Order $order) {
            if ($order->wasChanged('status')) {
                WebhookService::dispatch($order, 'order.status.'.$order->status);
                OrderNotificationService::notify($order);
            }
        });
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
