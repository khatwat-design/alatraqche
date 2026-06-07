<?php

declare(strict_types=1);

namespace App\Filament\Widgets\Analytics;

use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ProductCategoryStatsOverview extends BaseWidget
{
    protected static bool $isDiscovered = false;

    protected ?string $pollingInterval = '120s';

    protected function getStats(): array
    {
        $products = Product::query()->count();
        $soldProducts = Product::query()->whereHas('orderItems')->count();
        $categories = Category::query()->count();
        $itemsLines = OrderItem::query()->count();

        return [
            Stat::make('المنتجات في الكتالوج', (string) number_format($products)),
            Stat::make('منتجات وردت في طلبات', (string) number_format($soldProducts)),
            Stat::make('التصنيفات', (string) number_format($categories)),
            Stat::make('سطور بنود الطلبات', (string) number_format($itemsLines)),
        ];
    }
}
