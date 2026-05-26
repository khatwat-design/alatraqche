<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PhoneHelper;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CustomerAuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:32',
            'password' => 'required|string|min:8|max:255|confirmed',
        ]);

        $phone = PhoneHelper::normalize($data['phone']);

        if (Customer::query()->where('phone', $phone)->exists()) {
            return response()->json([
                'ok' => false,
                'message' => 'رقم الهاتف مسجّل مسبقاً. سجّل الدخول أو استخدم رقماً آخر.',
            ], 422);
        }

        $customer = Customer::query()->create([
            'name' => $data['name'],
            'phone' => $phone,
            'password' => $data['password'],
        ]);

        $customer->tokens()->where('name', 'store')->delete();
        $token = $customer->createToken('store')->plainTextToken;

        return response()->json([
            'ok' => true,
            'token' => $token,
            'tokenType' => 'Bearer',
            'customer' => $this->customerPayload($customer),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => 'required|string|max:32',
            'password' => 'required|string|max:255',
        ]);

        $phone = PhoneHelper::normalize($data['phone']);
        $customer = Customer::query()->where('phone', $phone)->first();

        if (! $customer || empty($customer->password)) {
            return response()->json([
                'ok' => false,
                'message' => 'لا يوجد حساب بهذا الرقم بعد. أكمل طلباً من المتجر أولاً ليُنشأ حسابك تلقائياً.',
            ], 401);
        }

        $passwordOk = Hash::check($data['password'], $customer->password)
            || Hash::check(PhoneHelper::normalize($data['password']), $customer->password);

        if (! $passwordOk) {
            return response()->json([
                'ok' => false,
                'message' => 'بيانات الدخول غير صحيحة.',
            ], 401);
        }

        $customer->tokens()->where('name', 'store')->delete();
        $token = $customer->createToken('store')->plainTextToken;

        return response()->json([
            'ok' => true,
            'token' => $token,
            'tokenType' => 'Bearer',
            'customer' => $this->customerPayload($customer),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['ok' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();

        return response()->json([
            'ok' => true,
            'customer' => $this->customerPayload($customer),
        ]);
    }

    private function customerPayload(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'email' => $customer->email,
        ];
    }
}
