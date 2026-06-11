<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

final class SmsService
{
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

    public static function client(): ?Client
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');

        if (blank($sid) || blank($token)) {
            return null;
        }

        return new Client($sid, $token);
    }

    /**
     * Send OTP via Twilio Verify API.
     * Returns the verification SID on success, or null on failure.
     */
    public static function sendOtp(string $phone): ?string
    {
        $verifySid = config('services.twilio.verify_sid');

        if (app()->environment('local', 'testing')) {
            Log::info('OTP (local) would be sent via Twilio Verify', [
                'phone' => $phone,
            ]);
            return 'local-simulated';
        }

        if (blank($verifySid)) {
            Log::warning('Twilio Verify not configured — OTP skipped', ['phone' => $phone]);
            return null;
        }

        try {
            $client = self::client();
            if (! $client) {
                return null;
            }

            $verification = $client->verify->v2->services($verifySid)
                ->verifications
                ->create(self::toE164($phone), 'sms');

            Log::info('OTP sent via Twilio Verify', [
                'phone' => $phone,
                'sid' => $verification->sid,
            ]);

            return $verification->sid;
        } catch (\Throwable $e) {
            Log::error('Twilio Verify send failed', [
                'phone' => $phone,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Verify OTP code via Twilio Verify API.
     * Returns true if the code is correct, false otherwise.
     */
    public static function verifyOtp(string $phone, string $code): bool
    {
        $verifySid = config('services.twilio.verify_sid');

        if (app()->environment('local', 'testing')) {
            Log::info('OTP verify (local) simulated as success', [
                'phone' => $phone,
                'code' => $code,
            ]);
            return true;
        }

        if (blank($verifySid)) {
            Log::warning('Twilio Verify not configured — OTP verification skipped', ['phone' => $phone]);
            return false;
        }

        try {
            $client = self::client();
            if (! $client) {
                return false;
            }

            $check = $client->verify->v2->services($verifySid)
                ->verificationChecks
                ->create(['to' => self::toE164($phone), 'code' => $code]);

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

    /**
     * Send a raw SMS (non-OTP) via Twilio Messages API.
     */
    public static function send(string $phone, string $message): bool
    {
        if (app()->environment('local', 'testing')) {
            Log::info('SMS (local)', [
                'phone' => $phone,
                'message' => $message,
            ]);
            return true;
        }

        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = config('services.twilio.from');

        if (blank($sid) || blank($token) || blank($from)) {
            Log::warning('Twilio not configured — SMS skipped', ['phone' => $phone]);
            return false;
        }

        try {
            $client = new Client($sid, $token);

            $client->messages->create(
                self::toE164($phone),
                [
                    'from' => $from,
                    'body' => $message,
                ]
            );

            Log::info('SMS sent via Twilio', ['phone' => $phone]);

            return true;
        } catch (\Throwable $e) {
            Log::error('SMS send failed', [
                'phone' => $phone,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
