<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\StoreSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Mpdf\Mpdf;

class ReportService
{
    private function mPdf(): Mpdf
    {
        return new Mpdf([
            'mode' => 'ar',
            'default_font' => 'dejavusans',
            'format' => 'A4-L',
            'margin_top' => 15,
            'margin_right' => 10,
            'margin_bottom' => 15,
            'margin_left' => 10,
        ]);
    }

    public function ordersReportFromOrders(\Illuminate\Support\Collection $orders): Mpdf
    {
        $summary = [
            'total_orders' => $orders->count(),
            'total_revenue' => $orders->sum('total'),
            'total_discount' => $orders->sum('discount'),
            'avg_order_value' => $orders->avg('total'),
            'status_breakdown' => $orders->groupBy('status')->map(fn ($g) => $g->count()),
        ];

        $store = StoreSetting::current();
        $html = view('reports.orders', [
            'orders' => $orders,
            'summary' => $summary,
            'store' => $store,
            'from' => null,
            'to' => null,
            'status' => null,
            'generatedAt' => now()->translatedFormat('j F Y H:i'),
        ])->render();

        $mpdf = $this->mPdf();
        $mpdf->WriteHTML($html);

        return $mpdf;
    }

    public function ordersReport(?string $from, ?string $to, ?string $status): Mpdf
    {
        $query = Order::query()->with('items');

        if ($from) $query->whereDate('created_at', '>=', $from);
        if ($to) $query->whereDate('created_at', '<=', $to);
        if ($status) $query->where('status', $status);

        $orders = $query->orderByDesc('created_at')->get();

        $summary = [
            'total_orders' => $orders->count(),
            'total_revenue' => $orders->sum('total'),
            'total_discount' => $orders->sum('discount'),
            'avg_order_value' => $orders->avg('total'),
            'status_breakdown' => $orders->groupBy('status')->map(fn ($g) => $g->count()),
        ];

        $store = StoreSetting::current();
        $html = view('reports.orders', [
            'orders' => $orders,
            'summary' => $summary,
            'store' => $store,
            'from' => $from,
            'to' => $to,
            'status' => $status,
            'generatedAt' => now()->translatedFormat('j F Y H:i'),
        ])->render();

        $mpdf = $this->mPdf();
        $mpdf->WriteHTML($html);

        return $mpdf;
    }

    public function customersReportFromCustomers(\Illuminate\Support\Collection $customers): Mpdf
    {
        $summary = [
            'total_customers' => $customers->count(),
            'customers_with_orders' => $customers->where('orders_count', '>', 0)->count(),
            'total_revenue' => $customers->sum('orders_sum_total'),
            'avg_per_customer' => $customers->avg('orders_sum_total'),
        ];

        $store = StoreSetting::current();
        $html = view('reports.customers', [
            'customers' => $customers,
            'summary' => $summary,
            'store' => $store,
            'from' => null,
            'to' => null,
            'generatedAt' => now()->translatedFormat('j F Y H:i'),
        ])->render();

        $mpdf = $this->mPdf();
        $mpdf->WriteHTML($html);

        return $mpdf;
    }

    public function customersReport(?string $from, ?string $to, ?string $sortBy = 'orders_count'): Mpdf
    {
        $query = Customer::query()
            ->withCount('orders')
            ->withSum('orders', 'total');

        if ($from) $query->whereHas('orders', fn ($q) => $q->whereDate('created_at', '>=', $from));
        if ($to) $query->whereHas('orders', fn ($q) => $q->whereDate('created_at', '<=', $to));

        $customers = $query->orderByDesc(
            match ($sortBy) {
                'total_spent' => 'orders_sum_total',
                default => 'orders_count',
            }
        )->get();

        $summary = [
            'total_customers' => $customers->count(),
            'customers_with_orders' => $customers->where('orders_count', '>', 0)->count(),
            'total_revenue' => $customers->sum('orders_sum_total'),
            'avg_per_customer' => $customers->avg('orders_sum_total'),
        ];

        $store = StoreSetting::current();
        $html = view('reports.customers', [
            'customers' => $customers,
            'summary' => $summary,
            'store' => $store,
            'from' => $from,
            'to' => $to,
            'generatedAt' => now()->translatedFormat('j F Y H:i'),
        ])->render();

        $mpdf = $this->mPdf();
        $mpdf->WriteHTML($html);

        return $mpdf;
    }

    public function analyticsReport(?string $from, ?string $to): Mpdf
    {
        $fromDate = $from ? Carbon::parse($from) : now()->startOfMonth();
        $toDate = $to ? Carbon::parse($to) : now();

        $totalOrders = Order::whereBetween('created_at', [$fromDate, $toDate])->count();
        $totalRevenue = Order::whereBetween('created_at', [$fromDate, $toDate])->sum('total');
        $totalDiscount = Order::whereBetween('created_at', [$fromDate, $toDate])->sum('discount');

        $revenueByDay = Order::whereBetween('created_at', [$fromDate, $toDate])
            ->select(DB::raw("DATE(created_at) as date"), DB::raw("SUM(total) as revenue"), DB::raw("COUNT(*) as orders_count"))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topProducts = Product::query()
            ->withCount(['orderItems as total_sold' => fn ($q) => $q->whereHas('order', fn ($oq) => $oq->whereBetween('created_at', [$fromDate, $toDate]))])
            ->withSum(['orderItems as total_revenue' => fn ($q) => $q->whereHas('order', fn ($oq) => $oq->whereBetween('created_at', [$fromDate, $toDate]))], 'subtotal')
            ->orderByDesc('total_sold')
            ->take(20)
            ->get();

        $ordersByStatus = Order::whereBetween('created_at', [$fromDate, $toDate])
            ->select('status', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as revenue'))
            ->groupBy('status')
            ->get();

        $ordersByCity = Order::whereBetween('created_at', [$fromDate, $toDate])
            ->select('customer_city', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as revenue'))
            ->groupBy('customer_city')
            ->orderByDesc('count')
            ->get();

        $categorySales = Category::query()
            ->withCount(['products as total_sold' => fn ($q) => $q->whereHas('orderItems', fn ($oiq) => $oiq->whereHas('order', fn ($oq) => $oq->whereBetween('created_at', [$fromDate, $toDate])))])
            ->orderByDesc('total_sold')
            ->get();

        $store = StoreSetting::current();
        $html = view('reports.analytics', [
            'store' => $store,
            'from' => $fromDate->toDateString(),
            'to' => $toDate->toDateString(),
            'generatedAt' => now()->translatedFormat('j F Y H:i'),
            'totalOrders' => $totalOrders,
            'totalRevenue' => $totalRevenue,
            'totalDiscount' => $totalDiscount,
            'avgOrderValue' => $totalOrders > 0 ? round($totalRevenue / $totalOrders) : 0,
            'revenueByDay' => $revenueByDay,
            'topProducts' => $topProducts,
            'ordersByStatus' => $ordersByStatus,
            'ordersByCity' => $ordersByCity,
            'categorySales' => $categorySales,
        ])->render();

        $mpdf = $this->mPdf();
        $mpdf->WriteHTML($html);

        return $mpdf;
    }
}
