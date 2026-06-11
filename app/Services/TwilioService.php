<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

final class TwilioService
{
    public static function client(): ?Client
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');

        if (blank($sid) || blank($token)) {
            return null;
        }

        return new Client($sid, $token);
    }

    private static function toE164(string $phone): string
    {
        $p = preg_replace('/\D/', '', $phone);

        if (str_starts_with($p, '00964')) {
            return '+964' . substr($p, 5);
        }

        if (str_starts_with($p, '964')) {
            return '+' . $p;
        }

        if (str_starts_with($p, '0')) {
            return '+964' . substr($p, 1);
        }

        if (str_starts_with($p, '+')) {
            return $p;
        }

        return '+964' . $p;
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
            if (! $client) {
                return false;
            }

            $client->verify->v2->services($verifySid)
                ->verifications
                ->create(self::toE164($phone), 'sms');

            Log::info('OTP sent via Twilio Verify', ['phone' => $phone]);

            return true;
        } catch (\Throwable $e) {
            Log::error('Twilio Verify send failed', [
                'phone' => $phone,
                'error' => $e->getMessage(),
            ]);
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
            if (! $client) {
                return false;
            }

            $check = $client->verify->v2->services($verifySid)
                ->verificationChecks
                ->create(self::toE164($phone), ['code' => $code]);

            if ($check->status === 'approved') {
                Log::info('OTP verified via Twilio Verify', ['phone' => $phone]);
                return true;
            }

            Log::warning('OTP verification failed', [
                'phone' => $phone,
                'status' => $check->status,
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::error('Twilio Verify check failed', [
                'phone' => $phone,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
