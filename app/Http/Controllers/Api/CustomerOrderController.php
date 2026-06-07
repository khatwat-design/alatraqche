<?php

namespace App\Http\Controllers\Api;

use App\Helpers\OrderHelper;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $orders = Order::query()
            ->where('customer_id', $customer->id)
            ->orderByDesc('id')
            ->paginate(20);

        $data = $orders->getCollection()->map(fn (Order $o) => [
            'id' => $o->id,
            'invoiceId' => $o->invoice_id,
            'status' => $o->status,
            'statusLabel' => OrderHelper::statusLabelAr($o->status),
            'total' => $o->total,
            'totalItems' => $o->total_items,
            'createdAt' => $o->created_at?->toIso8601String(),
        ])->values()->all();

        return response()->json([
            'ok' => true,
            'data' => $data,
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(Request $request, string $invoiceId): JsonResponse
    {
        /** @var Customer $customer */
        $customer = $request->user();

        $order = Order::query()
            ->where('customer_id', $customer->id)
            ->where('invoice_id', $invoiceId)
            ->with(['items' => fn ($q) => $q->orderBy('id')])
            ->first();

        if (! $order) {
            return response()->json([
                'ok' => false,
                'message' => 'الطلب غير موجود أو لا يخص حسابك.',
            ], 404);
        }

        return response()->json([
            'ok' => true,
            'order' => $this->orderPayload($order),
        ]);
    }

    private function orderPayload(Order $order): array
    {
        return [
            'id' => $order->id,
            'invoiceId' => $order->invoice_id,
            'status' => $order->status,
            'statusLabel' => OrderHelper::statusLabelAr($order->status),
            'customerName' => $order->customer_name,
            'customerPhone' => $order->customer_phone,
            'customerCity' => $order->customer_city,
            'customerAddress' => $order->customer_address,
            'subtotal' => $order->subtotal,
            'deliveryFee' => $order->delivery_fee,
            'total' => $order->total,
            'totalItems' => $order->total_items,
            'channel' => $order->channel,
            'createdAt' => $order->created_at?->toIso8601String(),
            'updatedAt' => $order->updated_at?->toIso8601String(),
            'items' => $order->items->map(fn ($i) => [
                'productId' => $i->product_id,
                'name' => $i->name,
                'quantity' => $i->quantity,
                'unitPrice' => $i->unit_price,
                'subtotal' => $i->subtotal,
            ])->values()->all(),
        ];
    }
}
