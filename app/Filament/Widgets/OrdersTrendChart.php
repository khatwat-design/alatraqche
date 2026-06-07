<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class OrdersTrendChart extends ChartWidget
{
    protected static bool $isDiscovered = false;

    protected ?string $pollingInterval = '120s';

    protected ?string $heading = 'اتجاه الطلبات';

    protected ?string $description = 'عدد الطلبات اليومية خلال آخر ١٤ يوماً';

    protected ?string $maxHeight = '280px';

    protected static ?int $sort = 4;

    protected int | string | array $columnSpan = 'full';

    protected function getData(): array
    {
        $labels = [];
        $counts = [];
        for ($i = 13; $i >= 0; $i--) {
            $day = Carbon::today()->subDays($i);
            $labels[] = $day->translatedFormat('j M');
            $counts[] = Order::query()->whereDate('created_at', $day)->count();
        }

        return [
            'datasets' => [
                [
                    'label' => 'عدد الطلبات',
                    'data' => $counts,
                    'borderColor' => 'rgb(245, 158, 11)',
                    'backgroundColor' => 'rgba(245, 158, 11, 0.08)',
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
                    'ticks' => ['precision' => 0],
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
