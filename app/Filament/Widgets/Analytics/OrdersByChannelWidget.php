<?php

declare(strict_types=1);

namespace App\Filament\Widgets\Analytics;

use Filament\Widgets\Widget;
use Illuminate\Support\Facades\DB;

class OrdersByChannelWidget extends Widget
{
    protected static bool $isDiscovered = false;

    protected string $view = 'filament.widgets.analytics.simple-data-table';

    protected int | string | array $columnSpan = 'full';

    public function getViewData(): array
    {
        $raw = DB::table('orders')
            ->selectRaw('channel')
            ->selectRaw('COUNT(*) as orders_count')
            ->selectRaw('COALESCE(SUM(total), 0) as revenue')
            ->groupBy('channel')
            ->orderByDesc('orders_count')
            ->get();

        $rows = $raw->map(fn ($r) => [
            $r->channel ?: '—',
            number_format((int) $r->orders_count),
            number_format((int) $r->revenue),
        ])->all();

        return [
            'heading' => 'الطلبات حسب قناة البيع',
            'description' => 'مثل: الويب، تطبيق، إلخ.',
            'columns' => ['القناة', 'عدد الطلبات', 'إجمالي المبيعات (د.ع)'],
            'rows' => $rows,
        ];
    }
}
