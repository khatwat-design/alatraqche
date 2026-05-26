<?php

declare(strict_types=1);

namespace App\Filament\Widgets\Analytics;

use Filament\Widgets\Widget;
use Illuminate\Support\Facades\DB;

class CategorySalesAnalyticsWidget extends Widget
{
    protected static bool $isDiscovered = false;

    protected static string $view = 'filament.widgets.analytics.simple-data-table';

    protected int | string | array $columnSpan = 'full';

    public function getViewData(): array
    {
        $raw = DB::table('order_items')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->selectRaw('categories.id as category_id')
            ->selectRaw('categories.name as category_name')
            ->selectRaw('SUM(order_items.quantity) as qty_sold')
            ->selectRaw('SUM(order_items.subtotal) as revenue')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->get();

        $rows = $raw->map(fn ($r) => [
            $r->category_name,
            number_format((int) $r->qty_sold),
            number_format((int) $r->revenue),
        ])->all();

        return [
            'heading' => 'مبيعات التصنيفات',
            'description' => 'تجميع بنود الطلبات حسب تصنيف المنتج في الكتالوج.',
            'columns' => ['التصنيف', 'الكمية المباعة', 'إجمالي الإيراد (د.ع)'],
            'rows' => $rows,
        ];
    }
}
