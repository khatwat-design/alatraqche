<?php

namespace App\Filament\Widgets;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Carbon;
use Illuminate\Support\Number;

class StoreStatsOverview extends BaseWidget
{
    protected static ?string $pollingInterval = '60s';

    protected ?string $heading = 'ملخص الأداء';

    protected ?string $description = 'مؤشرات حية مع مقارنة الشهرين — يتحدّث كل دقيقة';

    protected int | string | array $columnSpan = 'full';

    protected static ?int $sort = 1;

    /**
     * @return array{orders: array<int, float|int>, revenue: array<int, float|int>}
     */
    protected function lastFourteenDaysSeries(): array
    {
        $orders = [];
        $revenue = [];
        for ($i = 13; $i >= 0; $i--) {
            $day = Carbon::today()->subDays($i);
            $orders[] = Order::query()->whereDate('created_at', $day)->count();
            $revenue[] = (int) Order::query()->whereDate('created_at', $day)->sum('total');
        }

        return ['orders' => $orders, 'revenue' => $revenue];
    }

    protected function getStats(): array
    {
        $series = $this->lastFourteenDaysSeries();

        $ordersTotal = Order::query()->count();
        $ordersToday = Order::query()->whereDate('created_at', today())->count();
        $ordersYesterday = Order::query()->whereDate('created_at', today()->subDay())->count();

        $revenueAll = (int) Order::query()->sum('total');
        $revenueMonth = (int) Order::query()
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('total');
        $revenuePrevMonth = (int) Order::query()
            ->whereBetween('created_at', [
                now()->subMonthNoOverflow()->startOfMonth(),
                now()->subMonthNoOverflow()->endOfMonth(),
            ])
            ->sum('total');

        $pending = Order::query()->where('status', 'pending')->count();
        $products = Product::query()->count();
        $customers = Customer::query()->count();
        $lowStock = Product::query()->where('is_visible', true)->where('stock_qty', '<=', 10)->count();

        $avgBasket = $ordersTotal > 0 ? (int) round($revenueAll / $ordersTotal) : 0;

        $monthTrend = $revenuePrevMonth > 0
            ? round((($revenueMonth - $revenuePrevMonth) / $revenuePrevMonth) * 100, 1)
            : null;
        $monthTrendText = $monthTrend === null
            ? 'لا يوجد إيراد في الشهر السابق للمقارنة'
            : (($monthTrend >= 0 ? '↑ ' : '↓ ').abs($monthTrend).'% عن الشهر الماضي');

        return [
            Stat::make('إجمالي الطلبات', Number::format($ordersTotal, locale: 'ar'))
                ->description('مسجّلة في النظام')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->chart($series['orders'])
                ->chartColor('primary')
                ->color('primary'),
            Stat::make('إيراد الشهر (د.ع.)', Number::format($revenueMonth, locale: 'ar'))
                ->description($monthTrendText)
                ->descriptionIcon('heroicon-m-banknotes')
                ->chart($series['revenue'])
                ->chartColor('success')
                ->color('success'),
            Stat::make('طلبات اليوم', Number::format($ordersToday, locale: 'ar'))
                ->description('أمس: '.Number::format($ordersYesterday, locale: 'ar').' طلب')
                ->descriptionIcon('heroicon-m-calendar-days')
                ->color('info'),
            Stat::make('قيد الانتظار', Number::format($pending, locale: 'ar'))
                ->description('تحتاج متابعة أو تأكيد')
                ->descriptionIcon('heroicon-m-clock')
                ->color('warning'),
            Stat::make('متوسط قيمة الطلب (د.ع.)', Number::format($avgBasket, locale: 'ar'))
                ->description('الإيراد الكلي ÷ عدد الطلبات')
                ->descriptionIcon('heroicon-m-scale')
                ->color('gray'),
            Stat::make('إيراد كلي (د.ع.)', Number::format($revenueAll, locale: 'ar'))
                ->description('منذ أول طلب')
                ->descriptionIcon('heroicon-m-chart-bar')
                ->color('info'),
            Stat::make('تنبيه مخزون', Number::format($lowStock, locale: 'ar'))
                ->description('منتجات ظاهرة ومخزونها ≤ ١٠')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->descriptionColor($lowStock > 0 ? 'danger' : 'success')
                ->color($lowStock > 0 ? 'danger' : 'success'),
            Stat::make('العملاء', Number::format($customers, locale: 'ar'))
                ->description('سجلات فريدة (حسب الهاتف)')
                ->descriptionIcon('heroicon-m-users')
                ->color('gray'),
            Stat::make('المنتجات', Number::format($products, locale: 'ar'))
                ->description('في الكتالوج')
                ->descriptionIcon('heroicon-m-cube')
                ->color('gray'),
        ];
    }
}
