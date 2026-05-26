<?php

declare(strict_types=1);

namespace App\Filament\Pages\Analytics;

use App\Filament\Pages\Analytics\Concerns\HasAnalyticsExportHeaderActions;
use App\Filament\Widgets\Analytics\OrderAnalyticsStatsOverview;
use App\Filament\Widgets\Analytics\OrderRevenue30DayChart;
use App\Filament\Widgets\Analytics\OrdersByChannelWidget;
use App\Filament\Widgets\Analytics\OrdersByStatusTableWidget;
use App\Services\AnalyticsExportService;
use Filament\Pages\Page;

class OrderAnalyticsPage extends Page
{
    use HasAnalyticsExportHeaderActions;

    protected static string $view = 'filament.pages.analytics-hub';

    protected static ?string $navigationGroup = 'التحليلات';

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static ?string $title = 'تحليلات الطلبات';

    protected static ?string $navigationLabel = 'تحليلات الطلبات';

    protected static ?string $slug = 'analytics-orders';

    protected static ?int $navigationSort = 2;

    public function getHeaderWidgetsColumns(): int|string|array
    {
        return [
            'default' => 1,
            'md' => 2,
            'xl' => 5,
        ];
    }

    protected function getHeaderWidgets(): array
    {
        return [
            OrderAnalyticsStatsOverview::class,
            OrderRevenue30DayChart::class,
            OrdersByStatusTableWidget::class,
            OrdersByChannelWidget::class,
        ];
    }

    protected function getHeaderActions(): array
    {
        return [
            $this->makeAnalyticsExportGroup(
                fn (string $format) => AnalyticsExportService::downloadOrderReport($format)
            ),
        ];
    }
}
