<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class RevenueByDayChart extends ChartWidget
{
    protected static bool $isDiscovered = false;

    protected ?string $pollingInterval = '120s';

    protected ?string $heading = 'الإيراد اليومي';

    protected ?string $description = 'مجموع مبالغ الطلبات (دينار عراقي) — آخر ١٤ يوماً';

    protected ?string $maxHeight = '280px';

    protected static ?int $sort = 2;

    protected int | string | array $columnSpan = [
        'default' => 'full',
        'xl'      => 8,
    ];

    protected function getData(): array
    {
        $labels = [];
        $totals = [];
        for ($i = 13; $i >= 0; $i--) {
            $day = Carbon::today()->subDays($i);
            $labels[] = $day->translatedFormat('j M');
            $totals[] = (int) Order::query()->whereDate('created_at', $day)->sum('total');
        }

        return [
            'datasets' => [
                [
                    'label' => 'الإيراد (د.ع.)',
                    'data' => $totals,
                    'borderColor' => 'rgb(16, 185, 129)',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.08)',
                    'fill' => true,
                    'tension' => 0.4,
                    'borderWidth' => 2.5,
                    'pointRadius' => 3,
                    'pointHoverRadius' => 6,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
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
                ],
            ],
            'interaction' => [
                'intersect' => false,
                'mode' => 'index',
            ],
            'animation' => [
                'duration' => 450,
            ],
        ];
    }
}
