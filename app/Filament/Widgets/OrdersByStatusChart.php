<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class OrdersByStatusChart extends ChartWidget
{
    protected static bool $isDiscovered = false;

    protected ?string $pollingInterval = '120s';

    protected ?string $heading = 'توزيع الطلبات حسب الحالة';

    protected ?string $description = 'عدد الطلبات لكل حالة';

    protected ?string $maxHeight = '280px';

    protected static ?int $sort = 3;

    protected int | string | array $columnSpan = [
        'default' => 'full',
        'xl'      => 4,
    ];

    protected function getData(): array
    {
        $rows = Order::query()
            ->select('status', DB::raw('count(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $labels = [];
        $data = [];
        $labelMap = [
            'pending' => 'قيد الانتظار',
            'confirmed' => 'مؤكد',
            'processing' => 'قيد التجهيز',
            'shipped' => 'تم الشحن',
            'delivered' => 'تم التسليم',
            'cancelled' => 'ملغى',
        ];

        foreach ($rows as $status => $count) {
            $labels[] = $labelMap[$status] ?? $status;
            $data[] = (int) $count;
        }

        if ($labels === []) {
            $labels = ['لا توجد بيانات'];
            $data = [0];
        }

        return [
            'datasets' => [
                [
                    'label' => 'الطلبات',
                    'data' => $data,
                    'backgroundColor' => [
                        'rgba(234, 179, 8, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(217, 119, 6, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                    ],
                    'borderWidth' => 0,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
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
            'cutout' => '58%',
            'animation' => [
                'duration' => 500,
            ],
        ];
    }
}
