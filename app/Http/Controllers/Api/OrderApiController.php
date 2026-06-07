<?php

namespace App\Http\Controllers\Api;

use App\Helpers\OrderHelper;
use App\Helpers\PhoneHelper;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\CouponService;
use App\Services\WebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OrderApiController extends Controller
{
    public function validateCoupon(string $code, Request $request): JsonResponse
    {
        $subtotal = (float) $request->query('subtotal', 0);

        $coupon = CouponService::validate($code, $subtotal);

        if (! $coupon) {
            return response()->json([
                'ok' => false,
                'message' => 'كود الخصم غير صالح أو منتهي الصلاحية.',
            ], 422);
        }

        $discount = $coupon->calculateDiscount($subtotal);

        return response()->json([
            'ok' => true,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => (float) $coupon->value,
            'discount' => $discount,
            'maxDiscount' => $coupon->max_discount ? (float) $coupon->max_discount : null,
            'minOrder' => $coupon->min_order_amount ? (float) $coupon->min_order_amount : null,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer.name' => 'required|string|max:255',
            'customer.phone' => 'required|string|max:32',
            'customer.city' => 'nullable|string|max:128',
            'customer.address' => 'nullable|string|max:512',
            'customer.carType' => 'nullable|string|max:255',
            'customer.carModel' => 'nullable|string|max:255',
            'customer.notes' => 'nullable|string|max:2000',
            'customer.paymentMethod' => 'nullable|string|max:64',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|string|max:128',
            'items.*.name' => 'required|string|max:255',
            'items.*.price' => 'required|integer|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.subtotal' => 'required|integer|min:0',
            'items.*.options' => 'nullable|array',
            'items.*.options.*.optionId' => 'required_with:items.*.options|integer|exists:product_options,id',
            'items.*.options.*.valueId' => 'required_with:items.*.options|integer|exists:product_option_values,id',
            'items.*.options.*.value' => 'required_with:items.*.options|string|max:255',
            'summary.subtotal' => 'required|integer|min:0',
            'summary.deliveryFee' => 'nullable|integer|min:0',
            'summary.total' => 'required|integer|min:0',
            'summary.totalItems' => 'required|integer|min:1',
            'coupon' => 'nullable|string|max:50',
            'channel' => 'nullable|string|max:64',
        ]);

        $invoiceId = OrderHelper::generateInvoiceId();

        try {
            $subtotal = (float) $data['summary']['subtotal'];
            $couponModel = null;
            $discount = 0;

            if (! empty($data['coupon'])) {
                $couponModel = CouponService::validate($data['coupon'], $subtotal);
                if (! $couponModel) {
                    return response()->json([
                        'ok' => false,
                        'message' => 'كود الخصم غير صالح أو منتهي الصلاحية.',
                    ], 422);
                }
                $discount = $couponModel->calculateDiscount($subtotal);
            }

            $order = DB::transaction(function () use ($data, $invoiceId, $request, $couponModel, $discount) {
                foreach ($data['items'] as $row) {
                    $product = Product::query()->whereKey($row['id'])->lockForUpdate()->first();
                    if (! $product) {
                        throw ValidationException::withMessages([
                            'items' => 'منتج غير موجود: '.$row['id'],
                        ]);
                    }
                    if ($product->stock_qty < $row['quantity']) {
                        throw ValidationException::withMessages([
                            'items' => 'المخزون غير كافٍ لـ: '.$product->name,
                        ]);
                    }
                }

                $phone = PhoneHelper::normalize($data['customer']['phone']);

                $customer = Customer::query()->firstOrCreate(
                    ['phone' => $phone],
                    ['name' => $data['customer']['name']]
                );
                $customer->name = $data['customer']['name'];
                $customer->save();

                $totalAfterDiscount = max(0, (float) $data['summary']['total'] - $discount);

                $order = Order::query()->create([
                    'invoice_id' => $invoiceId,
                    'customer_id' => $customer->id,
                    'status' => 'pending',
                    'customer_name' => $data['customer']['name'],
                    'customer_phone' => $phone,
                    'customer_city' => $data['customer']['city'] ?? null,
                    'customer_address' => $data['customer']['address'] ?? null,
                    'floor_note' => $data['customer']['carType'] ?? null,
                    'delivery_time_note' => $data['customer']['carModel'] ?? null,
                    'notes' => $data['customer']['notes'] ?? null,
                    'payment_method' => $data['customer']['paymentMethod'] ?? 'cod',
                    'subtotal' => $data['summary']['subtotal'],
                    'delivery_fee' => $data['summary']['deliveryFee'] ?? 0,
                    'total' => $totalAfterDiscount,
                    'discount' => $discount,
                    'total_items' => $data['summary']['totalItems'],
                    'coupon_id' => $couponModel?->id,
                    'channel' => $data['channel'] ?? 'web',
                    'payload' => $request->all(),
                ]);

                if ($couponModel) {
                    CouponService::apply($couponModel);
                }

                foreach ($data['items'] as $row) {
                    OrderItem::query()->create([
                        'order_id' => $order->id,
                        'product_id' => $row['id'],
                        'name' => $row['name'],
                        'quantity' => $row['quantity'],
                        'unit_price' => $row['price'],
                        'subtotal' => $row['subtotal'],
                        'options' => $row['options'] ?? null,
                    ]);

                    Product::query()->whereKey($row['id'])->decrement('stock_qty', $row['quantity']);
                }

                return $order;
            });
        } catch (ValidationException $e) {
            return response()->json([
                'ok' => false,
                'errors' => $e->errors(),
            ], 422);
        }

        $storeToken = null;
        $customer = Customer::query()->whereKey($order->customer_id)->first();
        if ($customer) {
            $phone = PhoneHelper::normalize($data['customer']['phone']);

            if (empty($customer->password)) {
                $customer->password = bcrypt($phone);
                $customer->save();
            }

            $customer->tokens()->where('name', 'store')->delete();
            $storeToken = $customer->createToken('store')->plainTextToken;
        }

        Log::info('طلب جديد', [
            'invoice_id' => $order->invoice_id,
            'customer' => $data['customer']['name'],
            'total' => $data['summary']['total'],
            'items_count' => count($data['items']),
        ]);

        WebhookService::dispatch($order, 'order.created');

        return response()->json([
            'ok' => true,
            'invoiceId' => $order->invoice_id,
            'orderId' => $order->id,
            'storeToken' => $storeToken,
            'tokenType' => $storeToken ? 'Bearer' : null,
        ], 201);
    }
}
