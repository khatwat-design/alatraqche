<?php

namespace App\Services\Admin;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class AdminDashboardService
{
    public function getDashboardStats(): array
    {
        $now = now();
        $currentMonth = $now->copy()->startOfMonth();
        $prevMonth = $now->copy()->subMonth()->startOfMonth();

        return [
            'revenue' => $this->compareMonthly(
                Order::where('status', '!=', 'cancelled'),
                'total',
                $currentMonth,
                $prevMonth
            ),
            'orders' => $this->compareMonthlyCount(
                Order::query(),
                $currentMonth,
                $prevMonth
            ),
            'products' => $this->compareMonthlyCount(
                Product::query(),
                $currentMonth,
                $prevMonth
            ),
            'customers' => $this->compareMonthlyCount(
                Customer::query(),
                $currentMonth,
                $prevMonth
            ),
        ];
    }

    public function getAnalytics(): array
    {
        $totalRevenue = (float) Order::where('status', '!=', 'cancelled')->sum('total');
        $totalOrders = Order::count();
        $totalCustomers = Customer::count();

        return [
            'total_revenue' => $totalRevenue,
            'average_order' => $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0,
            'total_orders' => $totalOrders,
            'total_customers' => $totalCustomers,
            'monthly_revenue' => $this->getMonthlyRevenue(),
            'daily_orders' => $this->getDailyOrders(),
            'status_distribution' => $this->getStatusDistribution(),
            'cancellation_rate' => $this->getCancellationRate(),
        ];
    }

    private function compareMonthly($query, string $column, $currentStart, $prevStart): array
    {
        $current = (float) (clone $query)->where('created_at', '>=', $currentStart)->sum($column);
        $previous = (float) (clone $query)
            ->where('created_at', '>=', $prevStart)
            ->where('created_at', '<', $currentStart)
            ->sum($column);

        return compact('current', 'previous');
    }

    private function compareMonthlyCount($query, $currentStart, $prevStart): array
    {
        $current = (clone $query)->where('created_at', '>=', $currentStart)->count();
        $previous = (clone $query)
            ->where('created_at', '>=', $prevStart)
            ->where('created_at', '<', $currentStart)
            ->count();

        return compact('current', 'previous');
    }

    private function getMonthlyRevenue(): array
    {
        return Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', now()->subMonths(12))
            ->selectRaw("strftime('%Y-%m', created_at) as month")
            ->selectRaw('sum(total) as revenue')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => [
                'month' => $row->month,
                'revenue' => (float) $row->revenue,
            ])
            ->values()
            ->all();
    }

    private function getDailyOrders(): array
    {
        return Order::where('created_at', '>=', now()->subDays(7))
            ->selectRaw("strftime('%Y-%m-%d', created_at) as date")
            ->selectRaw('count(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'orders' => (int) $row->orders,
            ])
            ->values()
            ->all();
    }

    private function getStatusDistribution(): Collection
    {
        return Order::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status,
                'count' => (int) $row->count,
            ]);
    }

    private function getCancellationRate(): float
    {
        $total = Order::count();
        if ($total === 0) {
            return 0;
        }

        $cancelled = Order::where('status', 'cancelled')->count();

        return round(($cancelled / $total) * 100, 2);
    }
}
