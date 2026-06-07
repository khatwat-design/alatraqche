<?php

declare(strict_types=1);

namespace App\Filament\Clusters;

use Filament\Clusters\Cluster;

class AnalyticsCluster extends Cluster
{
    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-chart-pie';

    protected static ?string $navigationLabel = 'التحليلات';

    protected static ?string $title = 'التحليلات';

    protected static ?string $clusterBreadcrumb = 'التحليلات';

    protected static ?int $navigationSort = 12;
}
