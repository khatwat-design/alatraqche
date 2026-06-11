<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PhoneHelper;
use App\Http\Controllers\Controller;
use App\Services\TwilioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OtpController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => 'required|string|max:20',
        ]);

        $phone = PhoneHelper::normalize($data['phone']);
        $e164 = '+964' . substr($phone, 1);

        $sent = TwilioService::sendOtp($e164);

        if (! $sent) {
            return response()->json([
                'ok' => false,
                'message' => 'تعذر إرسال رمز التحقق. حاول مرة أخرى.',
            ], 500);
        }

        return response()->json([
            'ok' => true,
            'message' => 'تم إرسال رمز التحقق إلى هاتفك.',
        ]);
    }

    public function verify(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => 'required|string|max:20',
            'code' => 'required|string|size:6',
        ]);

        $phone = PhoneHelper::normalize($data['phone']);
        $e164 = '+964' . substr($phone, 1);

        $verified = TwilioService::verifyOtp($e164, $data['code']);

        if (! $verified) {
            return response()->json([
                'ok' => false,
                'message' => 'رمز التحقق غير صالح أو منتهي الصلاحية.',
            ], 422);
        }

        return response()->json([
            'ok' => true,
            'message' => 'تم التحقق بنجاح.',
        ]);
    }
}
