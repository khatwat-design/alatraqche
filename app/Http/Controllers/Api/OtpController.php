<?php

namespace App\Http\Controllers\Api;

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

        $sent = TwilioService::sendOtp($data['phone']);

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

        $verified = TwilioService::verifyOtp($data['phone'], $data['code']);

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
