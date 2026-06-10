<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCouponController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 50), 100);

        $coupons = Coupon::query()
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'ok' => true,
            'coupons' => $coupons->items(),
            'meta' => [
                'current_page' => $coupons->currentPage(),
                'last_page' => $coupons->lastPage(),
                'per_page' => $coupons->perPage(),
                'total' => $coupons->total(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $coupon = Coupon::query()->whereKey($id)->first();

        if (! $coupon) {
            return response()->json(['message' => 'الكوبون غير موجود.'], 404);
        }

        return response()->json([
            'ok' => true,
            'coupon' => $coupon,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => 'required|string|max:64|unique:coupons,code',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        $coupon = Coupon::query()->create([
            'code' => strtoupper($data['code']),
            'type' => $data['type'],
            'value' => $data['value'],
            'min_order_amount' => $data['min_order_amount'] ?? null,
            'max_discount' => $data['max_discount'] ?? null,
            'usage_limit' => $data['usage_limit'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'starts_at' => $data['starts_at'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
        ]);

        return response()->json([
            'ok' => true,
            'message' => 'تم إضافة الكوبون بنجاح.',
            'coupon' => $coupon,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $coupon = Coupon::query()->whereKey($id)->first();

        if (! $coupon) {
            return response()->json(['message' => 'الكوبون غير موجود.'], 404);
        }

        $data = $request->validate([
            'code' => 'sometimes|string|max:64|unique:coupons,code,' . $id,
            'type' => 'sometimes|in:fixed,percentage',
            'value' => 'sometimes|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'is_active' => 'sometimes|boolean',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        if (isset($data['code'])) {
            $coupon->code = strtoupper($data['code']);
        }
        if (isset($data['type'])) {
            $coupon->type = $data['type'];
        }
        if (isset($data['value'])) {
            $coupon->value = $data['value'];
        }
        if (array_key_exists('min_order_amount', $data)) {
            $coupon->min_order_amount = $data['min_order_amount'];
        }
        if (array_key_exists('max_discount', $data)) {
            $coupon->max_discount = $data['max_discount'];
        }
        if (array_key_exists('usage_limit', $data)) {
            $coupon->usage_limit = $data['usage_limit'];
        }
        if (isset($data['is_active'])) {
            $coupon->is_active = (bool) $data['is_active'];
        }
        if (array_key_exists('starts_at', $data)) {
            $coupon->starts_at = $data['starts_at'] ? Carbon::parse($data['starts_at']) : null;
        }
        if (array_key_exists('expires_at', $data)) {
            $coupon->expires_at = $data['expires_at'] ? Carbon::parse($data['expires_at']) : null;
        }

        $coupon->save();

        return response()->json([
            'ok' => true,
            'message' => 'تم تحديث الكوبون بنجاح.',
            'coupon' => $coupon,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $coupon = Coupon::query()->whereKey($id)->first();

        if (! $coupon) {
            return response()->json(['message' => 'الكوبون غير موجود.'], 404);
        }

        $coupon->delete();

        return response()->json([
            'ok' => true,
            'message' => 'تم حذف الكوبون بنجاح.',
        ]);
    }
}
