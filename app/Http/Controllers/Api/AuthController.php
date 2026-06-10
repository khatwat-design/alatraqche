<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PhoneHelper;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\TwilioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function requestOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => 'required|string|max:20',
        ]);

        $phone = PhoneHelper::normalize($data['phone']);

        if (! str_starts_with($phone, '0') || strlen($phone) < 10) {
            return response()->json([
                'ok' => false,
                'message' => 'رقم الهاتف غير صالح. يجب أن يبدأ بـ 077 أو 078 أو 079.',
            ], 422);
        }

        $e164 = '+964' . substr($phone, 1);

        $sent = TwilioService::sendOtp($e164);

        if (! $sent) {
            return response()->json([
                'ok' => false,
                'message' => 'تعذر إرسال رمز التحقق. حاول مرة أخرى لاحقاً.',
            ], 500);
        }

        return response()->json([
            'ok' => true,
            'message' => 'تم إرسال رمز التحقق إلى هاتفك.',
        ]);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => 'required|string|max:20',
            'code' => 'required|string|size:6',
        ]);

        $phone = PhoneHelper::normalize($data['phone']);

        if (! str_starts_with($phone, '0') || strlen($phone) < 10) {
            return response()->json([
                'ok' => false,
                'message' => 'رقم الهاتف غير صالح.',
            ], 422);
        }

        $e164 = '+964' . substr($phone, 1);

        $verified = TwilioService::verifyOtp($e164, $data['code']);

        if (! $verified) {
            return response()->json([
                'ok' => false,
                'message' => 'رمز التحقق غير صالح أو منتهي الصلاحية.',
            ], 422);
        }

        $isNew = false;
        $customer = Customer::query()->where('phone', $phone)->first();

        if (! $customer) {
            $customer = Customer::query()->create([
                'phone' => $phone,
                'name' => null,
                'phone_verified_at' => now(),
            ]);
            $isNew = true;
        } else {
            $customer->phone_verified_at = now();
            $customer->save();
        }

        $customer->tokens()->where('name', 'store')->delete();
        $token = $customer->createToken('store')->plainTextToken;

        return response()->json([
            'ok' => true,
            'token' => $token,
            'tokenType' => 'Bearer',
            'user' => [
                'id' => $customer->id,
                'phone' => $customer->phone,
                'name' => $customer->name,
            ],
            'is_new_user' => $isNew,
        ]);
    }
}
