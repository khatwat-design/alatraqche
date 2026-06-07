<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Coupon;

final class CouponService
{
    public static function validate(string $code, float $subtotal): ?Coupon
    {
        $coupon = Coupon::query()->where('code', $code)->first();

        if (! $coupon) {
            return null;
        }

        if (! $coupon->isValid()) {
            return null;
        }

        $discount = $coupon->calculateDiscount($subtotal);

        if ($discount <= 0) {
            return null;
        }

        return $coupon;
    }

    public static function apply(Coupon $coupon): void
    {
        $coupon->increment('used_count');
    }
}
