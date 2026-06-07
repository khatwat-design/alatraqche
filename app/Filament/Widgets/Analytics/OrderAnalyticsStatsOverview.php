<?php

declare(strict_types=1);

namespace App\Filament\Widgets\Analytics;

use App\Models\Order;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Carbon;

class OrderAnalyticsStatsOverview extends BaseWidget
{
    protected static bool $isDiscovered = false;

    protected ?string $pollingInterval = '90s';

    protected function getStats(): array
    {
        $today = Order::query()->whereDate('created_at', Carbon::today())->count();
        $week = Order::query()->where('created_at', '>=', Carbon::now()->subDays(7))->count();
        $month = Order::query()->where('created_at', '>=', Carbon::now()->subDays(30))->count();
        $pending = Order::query()->where('status', 'pending')->count();
        $avg = (int) round(Order::query()->avg('total') ?? 0);

        return [
            Stat::make('طلبات اليوم', (string) number_format($today)),
            Stat::make('آخر ٧ أيام', (string) number_format($week)),
            Stat::make('آخر ٣٠ يوماً', (string) number_format($month)),
            Stat::make('قيد الانتظار', (string) number_format($pending))->color('warning'),
            Stat::make('متوسط قيمة الطلب', number_format($avg).' د.ع'),
        ];
    }
}
