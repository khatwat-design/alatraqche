<?php

declare(strict_types=1);

namespace App\Filament\Pages\Analytics;

use App\Filament\Pages\Analytics\Concerns\HasAnalyticsExportHeaderActions;
use App\Filament\Widgets\Analytics\CustomerAnalyticsStatsOverview;
use App\Filament\Widgets\Analytics\OrdersByCityWidget;
use App\Filament\Widgets\Analytics\TopCustomersTableWidget;
use App\Services\AnalyticsExportService;
use Filament\Pages\Page;

class CustomerAnalyticsPage extends Page
{
    use HasAnalyticsExportHeaderActions;

    protected static string $view = 'filament.pages.analytics-hub';

    protected static ?string $navigationGroup = 'التحليلات';

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $title = 'تحليلات العملاء';

    protected static ?string $navigationLabel = 'تحليلات العملاء';

    protected static ?string $slug = 'analytics-customers';

    protected static ?int $navigationSort = 1;

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
            CustomerAnalyticsStatsOverview::class,
            TopCustomersTableWidget::class,
            OrdersByCityWidget::class,
        ];
    }

    protected function getHeaderActions(): array
    {
        return [
            $this->makeAnalyticsExportGroup(
                fn (string $format) => AnalyticsExportService::downloadCustomerReport($format)
            ),
        ];
    }
}
