<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderRequest;
use App\Http\Resources\OrderCollection;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(Request $request): OrderCollection
    {
        $perPage = min((int) $request->query('per_page', 50), 100);
        $search = $request->query('search');
        $status = $request->query('status');

        $query = Order::query()->with('items');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_id', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        $orders = $query->orderByDesc('created_at')->paginate($perPage);

        return new OrderCollection($orders);
    }

    public function show(string $id): OrderResource|JsonResponse
    {
        $order = Order::query()->with('items', 'customer')->whereKey($id)->first();

        if (! $order) {
            return response()->json(['message' => 'الطلب غير موجود.'], 404);
        }

        return new OrderResource($order);
    }

    public function update(UpdateOrderRequest $request, string $id): JsonResponse
    {
        $order = Order::query()->whereKey($id)->first();

        if (! $order) {
            return response()->json(['message' => 'الطلب غير موجود.'], 404);
        }

        $order->status = $request->validated('status');
        $order->save();

        return response()->json([
            'ok' => true,
            'message' => 'تم تحديث حالة الطلب بنجاح',
            'order' => new OrderResource($order->load('items', 'customer')),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $order = Order::query()->whereKey($id)->first();

        if (! $order) {
            return response()->json(['message' => 'الطلب غير موجود.'], 404);
        }

        $order->items()->delete();
        $order->delete();

        return response()->json([
            'ok' => true,
            'message' => 'تم حذف الطلب بنجاح',
        ]);
    }
}
