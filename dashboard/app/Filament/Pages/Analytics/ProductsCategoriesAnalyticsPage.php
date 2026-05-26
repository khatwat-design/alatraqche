<?php

declare(strict_types=1);

namespace App\Filament\Pages\Analytics;

use App\Filament\Pages\Analytics\Concerns\HasAnalyticsExportHeaderActions;
use App\Filament\Widgets\Analytics\CategorySalesAnalyticsWidget;
use App\Filament\Widgets\Analytics\ProductCategoryStatsOverview;
use App\Filament\Widgets\Analytics\TopProductsAnalyticsTableWidget;
use App\Services\AnalyticsExportService;
use Filament\Pages\Page;

class ProductsCategoriesAnalyticsPage extends Page
{
    use HasAnalyticsExportHeaderActions;

    protected static string $view = 'filament.pages.analytics-hub';

    protected static ?string $navigationGroup = 'التحليلات';

    protected static ?string $navigationIcon = 'heroicon-o-cube';

    protected static ?string $title = 'تحليلات المنتجات والتصنيفات';

    protected static ?string $navigationLabel = 'تحليلات المنتجات والتصنيفات';

    protected static ?string $slug = 'analytics-products';

    protected static ?int $navigationSort = 3;

    public function getHeaderWidgetsColumns(): int|string|array
    {
        return [
            'default' => 1,
            'md' => 2,
            'xl' => 4,
        ];
    }

    protected function getHeaderWidgets(): array
    {
        return [
            ProductCategoryStatsOverview::class,
            TopProductsAnalyticsTableWidget::class,
            CategorySalesAnalyticsWidget::class,
        ];
    }

    protected function getHeaderActions(): array
    {
        return [
            $this->makeAnalyticsExportGroup(
                fn (string $format) => AnalyticsExportService::downloadProductCategoryReport($format)
            ),
        ];
    }
}
