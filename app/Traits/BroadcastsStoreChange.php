<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

trait BroadcastsStoreChange
{
    protected static function bootBroadcastsStoreChange(): void
    {
        $type = static::storeChangeType();

        static::saved(fn ()   => static::notifyStoreChange($type));
        static::deleted(fn () => static::notifyStoreChange($type));
    }

    public static function notifyStoreChange(string $type): void
    {
        Cache::put('storefront.last_change', time(), now()->addHours(2));
        Cache::put('storefront.last_change_type', $type, now()->addHours(2));
    }

    protected static function storeChangeType(): string
    {
        return 'all';
    }
}
