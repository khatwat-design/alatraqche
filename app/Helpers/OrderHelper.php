<?php

namespace App\Helpers;

use Illuminate\Support\Str;

class OrderHelper
{
    public static function statusLabelAr(string $status): string
    {
        return match ($status) {
            'pending' => 'قيد الانتظار',
            'confirmed' => 'مؤكد',
            'processing' => 'قيد التجهيز',
            'shipped' => 'تم الشحن',
            'delivered' => 'تم التسليم',
            'cancelled' => 'ملغى',
            default => $status,
        };
    }

    public static function generateInvoiceId(): string
    {
        return 'INV-'.strtoupper(Str::random(10));
    }
}
