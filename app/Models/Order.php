<?php

namespace App\Models;

use App\Jobs\DispatchWebhookJob;
use App\Jobs\SendOrderNotificationJob;
use App\Models\User;
use App\Notifications\OrderCreated;
use App\Notifications\OrderStatusChanged;
use App\Services\OrderNotificationService;
use App\Services\WebhookService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Notification;

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
        static::created(function (Order $order) {
            $admins = User::where('is_admin', true)->get();
            Notification::send($admins, new OrderCreated($order));
        });

        static::updated(function (Order $order) {
            if ($order->wasChanged('status')) {
                $oldStatus = $order->getOriginal('status');
                $admins = User::where('is_admin', true)->get();
                Notification::send($admins, new OrderStatusChanged($order, $oldStatus, $order->status));
                DispatchWebhookJob::dispatch($order, 'order.status.'.$order->status);
                SendOrderNotificationJob::dispatch($order);
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

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }
}
