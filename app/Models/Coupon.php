<?php

namespace App\Models;

use App\Traits\BroadcastsStoreChange;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use BroadcastsStoreChange;

    protected static function storeChangeType(): string { return 'coupons'; }

    protected $guarded = ['id', 'used_count'];

    protected function casts(): array
    {
        return [
            'type' => 'string',
            'value' => 'decimal:2',
            'min_order_amount' => 'decimal:2',
            'max_discount' => 'decimal:2',
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->usage_limit && $this->used_count >= $this->usage_limit) {
            return false;
        }

        if ($this->starts_at && Carbon::parse($this->starts_at)->isFuture()) {
            return false;
        }

        if ($this->expires_at && Carbon::parse($this->expires_at)->isPast()) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(float $subtotal): float
    {
        if ($this->min_order_amount && $subtotal < (float) $this->min_order_amount) {
            return 0;
        }

        $discount = $this->type === 'fixed'
            ? (float) $this->value
            : $subtotal * ((float) $this->value / 100);

        if ($this->max_discount) {
            $discount = min($discount, (float) $this->max_discount);
        }

        return round($discount, 2);
    }
}
