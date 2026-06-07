<?php

declare(strict_types=1);

namespace App\Filament\Widgets\Analytics;

use App\Filament\Resources\OrderResource;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\DB;

class OrdersByStatusTableWidget extends Widget
{
    protected static bool $isDiscovered = false;

    protected string $view = 'filament.widgets.analytics.simple-data-table';

    protected int | string | array $columnSpan = 'full';

    public function getViewData(): array
    {
        $raw = DB::table('orders')
            ->selectRaw('status')
            ->selectRaw('COUNT(*) as orders_count')
            ->selectRaw('COALESCE(SUM(total), 0) as revenue')
            ->groupBy('status')
            ->orderByDesc('orders_count')
            ->get();

        $rows = $raw->map(function ($r) {
            $label = match ((string) $r->status) {
                'pending' => 'قيد الانتظار',
                'confirmed' => 'مؤكد',
                'processing' => 'قيد التجهيز',
                'shipped' => 'تم الشحن',
                'delivered' => 'تم التسليم',
                'cancelled' => 'ملغى',
                default => (string) $r->status,
            };

            return [
                $label,
                number_format((int) $r->orders_count),
                number_format((int) $r->revenue),
            ];
        })->all();

        return [
            'heading' => 'الطلبات حسب الحالة',
            'description' => 'يمكن تعديل حالات الطلبات من قسم '.OrderResource::getNavigationLabel().'.',
            'columns' => ['الحالة', 'عدد الطلبات', 'إجمالي المبيعات (د.ع)'],
            'rows' => $rows,
        ];
    }
}
