<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

final class TwilioService
{
    private static function client(): ?Client
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');

        if (blank($sid) || blank($token)) {
            return null;
        }

        return new Client($sid, $token);
    }

    public static function sendOtp(string $phone): bool
    {
        $verifySid = config('services.twilio.verify_sid');

        if (blank($verifySid)) {
            Log::warning('Twilio Verify not configured — OTP skipped', ['phone' => $phone]);
            return false;
        }

        try {
            $client = self::client();

            $client?->verify->v2->services($verifySid)
                ->verifications
                ->create($phone, 'sms');

            Log::info('OTP sent via Twilio Verify', ['phone' => $phone]);

            return true;
        } catch (\Throwable $e) {
            report($e);
            return false;
        }
    }

    public static function verifyOtp(string $phone, string $code): bool
    {
        $verifySid = config('services.twilio.verify_sid');

        if (blank($verifySid)) {
            Log::warning('Twilio Verify not configured — verification skipped');
            return false;
        }

        try {
            $client = self::client();

            $check = $client?->verify->v2->services($verifySid)
                ->verificationChecks
                ->create($phone, ['code' => $code]);

            if ($check && $check->status === 'approved') {
                Log::info('OTP verified via Twilio Verify', ['phone' => $phone]);
                return true;
            }

            Log::warning('OTP verification failed', [
                'phone' => $phone,
                'status' => $check?->status ?? 'unknown',
            ]);

            return false;
        } catch (\Throwable $e) {
            report($e);
            return false;
        }
    }
}
