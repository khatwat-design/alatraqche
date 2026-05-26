<?php

declare(strict_types=1);

namespace App\Filament\Widgets\Analytics;

use App\Models\Order;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class OrderRevenue30DayChart extends ChartWidget
{
    protected static bool $isDiscovered = false;

    protected static ?string $heading = 'إيراد الطلبات (٣٠ يوماً)';

    protected static ?string $description = 'مجموع «الإجمالي» اليومي للطلبات';

    protected static ?string $maxHeight = '320px';

    protected int | string | array $columnSpan = 'full';

    protected function getData(): array
    {
        $labels = [];
        $totals = [];
        for ($i = 29; $i >= 0; $i--) {
            $day = Carbon::today()->subDays($i);
            $labels[] = $day->translatedFormat('j M');
            $totals[] = (int) Order::query()
                ->whereDate('created_at', $day)
                ->sum('total');
        }

        return [
            'datasets' => [
                [
                    'label' => 'الإيراد (د.ع)',
                    'data' => $totals,
                    'borderColor' => 'rgb(234, 179, 8)',
                    'backgroundColor' => 'rgba(234, 179, 8, 0.15)',
                    'fill' => true,
                    'tension' => 0.3,
                    'borderWidth' => 2,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'display' => true,
                    'position' => 'bottom',
                    'rtl' => true,
                ],
            ],
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                    'ticks' => ['precision' => 0],
                ],
            ],
        ];
    }
}
