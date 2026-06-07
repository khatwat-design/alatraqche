<?php

declare(strict_types=1);

namespace App\Filament\Widgets\Analytics;

use Filament\Widgets\Widget;
use Illuminate\Support\Facades\DB;

class OrdersByCityWidget extends Widget
{
    protected static bool $isDiscovered = false;

    protected string $view = 'filament.widgets.analytics.orders-by-city';

    protected int | string | array $columnSpan = 'full';

    public function getViewData(): array
    {
        $rows = DB::table('orders')
            ->selectRaw("COALESCE(NULLIF(TRIM(customer_city), ''), 'غير محدد') as city_name")
            ->selectRaw('COUNT(DISTINCT customer_phone) as people_count')
            ->selectRaw('COUNT(*) as orders_count')
            ->selectRaw('COALESCE(SUM(total), 0) as revenue_total')
            ->groupBy('city_name')
            ->orderByDesc('orders_count')
            ->get();

        return [
            'heading' => 'توزيع الطلبات حسب المدينة / المحافظة',
            'description' => 'يُؤخذ من حقل «المدينة» في الطلب. «عدد الأشخاص» = أرقام هواتف مميزة ضمن كل مدينة.',
            'rows' => $rows,
        ];
    }
}
