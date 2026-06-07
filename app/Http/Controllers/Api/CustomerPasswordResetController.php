<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PhoneHelper;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\SmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CustomerPasswordResetController extends Controller
{
    public function sendOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => 'required|string|max:32',
        ]);

        $phone = PhoneHelper::normalize($data['phone']);
        $customer = Customer::query()->where('phone', $phone)->first();

        if (! $customer || empty($customer->password)) {
            return response()->json([
                'ok' => false,
                'message' => 'لا يوجد حساب بهذا الرقم.',
            ], 404);
        }

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('customer_password_reset_tokens')->insert([
            'phone' => $phone,
            'token' => $otp,
            'expires_at' => now()->addMinutes(15),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Log::info('OTP for password reset', ['phone' => $phone, 'otp' => $otp]);

        SmsService::sendOtp($phone, $otp);

        return response()->json([
            'ok' => true,
            'message' => 'تم إرسال رمز التحقق إلى هاتفك.',
        ]);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => 'required|string|max:32',
            'token' => 'required|string|size:6',
            'password' => 'required|string|min:8|max:255|confirmed',
        ]);

        $phone = PhoneHelper::normalize($data['phone']);

        $record = DB::table('customer_password_reset_tokens')
            ->where('phone', $phone)
            ->where('token', $data['token'])
            ->where('used_at', null)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $record) {
            return response()->json([
                'ok' => false,
                'message' => 'رمز التحقق غير صالح أو منتهي الصلاحية.',
            ], 422);
        }

        $customer = Customer::query()->where('phone', $phone)->first();
        if (! $customer) {
            return response()->json([
                'ok' => false,
                'message' => 'حساب غير موجود.',
            ], 404);
        }

        $customer->password = bcrypt($data['password']);
        $customer->save();

        DB::table('customer_password_reset_tokens')
            ->where('id', $record->id)
            ->update(['used_at' => now()]);

        $customer->tokens()->where('name', 'store')->delete();
        $token = $customer->createToken('store')->plainTextToken;

        return response()->json([
            'ok' => true,
            'token' => $token,
            'tokenType' => 'Bearer',
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
            ],
        ]);
    }
}
