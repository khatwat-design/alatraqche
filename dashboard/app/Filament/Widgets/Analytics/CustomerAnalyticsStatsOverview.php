<?php

declare(strict_types=1);

namespace App\Filament\Widgets\Analytics;

use App\Models\Customer;
use App\Models\Order;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\DB;

class CustomerAnalyticsStatsOverview extends BaseWidget
{
    protected static bool $isDiscovered = false;

    protected static ?string $pollingInterval = '90s';

    protected function getStats(): array
    {
        $customers = Customer::query();
        $withOrders = (clone $customers)->has('orders')->count();
        $totalCustomers = $customers->count();
        $cities = (int) DB::table('orders')
            ->whereNotNull('customer_city')
            ->whereRaw("TRIM(customer_city) != ''")
            ->distinct()
            ->count('customer_city');

        return [
            Stat::make('إجمالي العملاء', (string) number_format($totalCustomers)),
            Stat::make('عملاء نفّذوا طلباً', (string) number_format($withOrders)),
            Stat::make('إجمالي الطلبات', (string) number_format(Order::query()->count())),
            Stat::make('مدن/محافظات في الطلبات', (string) number_format($cities))
                ->description('قيم مختلفة لحقل المدينة'),
        ];
    }
}
