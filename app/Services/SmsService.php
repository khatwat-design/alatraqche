<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Log;

final class SmsService
{
    private const string GATEWAY_URL = 'https://api.example.com/sms/send';

    public static function send(string $phone, string $message): bool
    {
        if (app()->environment('local', 'testing')) {
            Log::info('SMS (local)', [
                'phone' => $phone,
                'message' => $message,
            ]);
            return true;
        }

        try {
            $response = \Illuminate\Support\Facades\Http::timeout(10)
                ->post(self::GATEWAY_URL, [
                    'to' => $phone,
                    'message' => $message,
                    'sender' => config('app.name'),
                ]);

            return $response->successful();
        } catch (\Throwable $e) {
            Log::error('SMS send failed', [
                'phone' => $phone,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public static function sendOtp(string $phone, string $otp): bool
    {
        $message = "رمز التحقق الخاص بك في " . config('app.name') . " هو: {$otp}\n"
                 . "الكود صالح لمدة 15 دقيقة.";

        return self::send($phone, $message);
    }
}
