<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PhoneHelper;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Services\TwilioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class OrderOtpController extends Controller
{
    public function requestConfirmation(Request $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();

        if (! $customer->phone) {
            return response()->json([
                'ok' => false,
                'message' => 'لا يوجد رقم هاتف مسجل للحساب.',
            ], 400);
        }

        $phone = PhoneHelper::normalize($customer->phone);
        $e164 = '+964' . substr($phone, 1);

        $sent = TwilioService::sendOtp($e164);

        if (! $sent) {
            return response()->json([
                'ok' => false,
                'message' => 'تعذر إرسال رمز التحقق. حاول مرة أخرى لاحقاً.',
            ], 500);
        }

        Cache::put(
            "order_otp_{$customer->id}",
            'pending',
            now()->addMinutes(10)
        );

        return response()->json([
            'ok' => true,
            'message' => 'تم إرسال رمز التحقق إلى هاتفك لتأكيد الطلب.',
        ]);
    }

    public function confirm(Request $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $data = $request->validate([
            'code' => 'required|string|size:6',
            'order_data' => 'required|array',
            'order_data.customer' => 'required|array',
            'order_data.customer.name' => 'required|string|max:255',
            'order_data.customer.city' => 'required|string|max:255',
            'order_data.customer.address' => 'nullable|string|max:1000',
            'order_data.customer.carType' => 'nullable|string|max:255',
            'order_data.customer.carModel' => 'nullable|string|max:255',
            'order_data.customer.notes' => 'nullable|string|max:2000',
            'order_data.items' => 'required|array|min:1',
            'order_data.items.*.id' => 'required|string',
            'order_data.items.*.name' => 'required|string|max:500',
            'order_data.items.*.price' => 'required|numeric|min:0',
            'order_data.items.*.quantity' => 'required|integer|min:1',
            'order_data.items.*.subtotal' => 'required|numeric|min:0',
            'order_data.summary' => 'required|array',
            'order_data.summary.subtotal' => 'required|numeric|min:0',
            'order_data.summary.total' => 'required|numeric|min:0',
            'order_data.coupon' => 'nullable|string|max:64',
        ]);

        if (Cache::get("order_otp_{$customer->id}") !== 'pending') {
            return response()->json([
                'ok' => false,
                'message' => 'لم يتم طلب رمز التحقق بعد. أرسل الرمز أولاً.',
            ], 400);
        }

        $phone = PhoneHelper::normalize($customer->phone);
        $e164 = '+964' . substr($phone, 1);

        $verified = TwilioService::verifyOtp($e164, $data['code']);

        if (! $verified) {
            return response()->json([
                'ok' => false,
                'message' => 'رمز التحقق غير صالح أو منتهي الصلاحية.',
            ], 422);
        }

        Cache::forget("order_otp_{$customer->id}");

        if (! $customer->name && ! empty($data['order_data']['customer']['name'])) {
            $customer->name = $data['order_data']['customer']['name'];
            $customer->save();
        }

        $orderData = $data['order_data'];
        $items = [];

        foreach ($orderData['items'] as $item) {
            $items[] = [
                'product_id' => $item['id'],
                'product_name' => $item['name'],
                'price' => (float) $item['price'],
                'quantity' => (int) $item['quantity'],
                'subtotal' => (float) $item['subtotal'],
            ];
        }

        $order = Order::query()->create([
            'customer_id' => $customer->id,
            'customer_name' => $orderData['customer']['name'],
            'customer_phone' => $customer->phone,
            'city' => $orderData['customer']['city'],
            'address' => $orderData['customer']['address'] ?? '',
            'car_type' => $orderData['customer']['carType'] ?? '',
            'car_model' => $orderData['customer']['carModel'] ?? '',
            'notes' => $orderData['customer']['notes'] ?? '',
            'subtotal' => (float) $orderData['summary']['subtotal'],
            'delivery_fee' => (float) ($orderData['summary']['deliveryFee'] ?? 0),
            'total' => (float) $orderData['summary']['total'],
            'items' => $items,
            'coupon_code' => $orderData['coupon'] ?? null,
            'status' => 'pending',
            'channel' => 'storefront',
        ]);

        $order->invoice_id = 'ALQ-' . strtoupper(str()->random(8));
        $order->save();

        return response()->json([
            'ok' => true,
            'message' => 'تم تأكيد الطلب بنجاح.',
            'order' => [
                'id' => $order->id,
                'invoiceId' => $order->invoice_id,
                'total' => (float) $order->total,
                'status' => $order->status,
            ],
        ], 201);
    }
}
