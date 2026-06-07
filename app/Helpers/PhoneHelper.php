<?php

namespace App\Helpers;

class PhoneHelper
{
    public static function normalize(string $phone): string
    {
        $p = preg_replace('/\s+/', '', $phone) ?? $phone;

        if (str_starts_with($p, '00964')) {
            return '0'.substr($p, 5);
        }

        if (str_starts_with($p, '+964')) {
            return '0'.substr($p, 4);
        }

        if (str_starts_with($p, '964') && !str_starts_with($p, '9640')) {
            return '0'.substr($p, 3);
        }

        return $p;
    }
}
