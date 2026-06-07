<?php

declare(strict_types=1);

namespace App\Filament\Pages\Analytics\Concerns;

use App\Services\ReportService;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

trait HasAnalyticsExportHeaderActions
{
    /**
     * @param  callable(string): (Response|StreamedResponse)  $export
     */
    protected function makeAnalyticsExportGroup(callable $export): ActionGroup
    {
        return ActionGroup::make([
            Action::make('export_analytics_csv')
                ->label('CSV')
                ->icon('heroicon-o-table-cells')
                ->action(fn () => $export('csv')),
            Action::make('export_analytics_json')
                ->label('JSON')
                ->icon('heroicon-o-code-bracket')
                ->action(fn () => $export('json')),
            Action::make('export_analytics_xlsx')
                ->label('Excel (.xlsx)')
                ->icon('heroicon-o-document-chart-bar')
                ->action(fn () => $export('xlsx')),
            Action::make('export_analytics_ods')
                ->label('Calc (.ods)')
                ->icon('heroicon-o-document-text')
                ->action(fn () => $export('ods')),
            Action::make('export_analytics_pdf')
                ->label('PDF')
                ->icon('heroicon-o-document-arrow-down')
                ->action(function () {
                    $pdf = app(ReportService::class)->analyticsReport(
                        request()->query('from'),
                        request()->query('to'),
                    );
                    return response()->streamDownload(function () use ($pdf) {
                        echo $pdf->Output('', 'S');
                    }, 'analytics-'.now()->format('Y-m-d').'.pdf', ['Content-Type' => 'application/pdf']);
                }),
        ])
            ->label('تصدير التقرير')
            ->icon('heroicon-o-arrow-down-tray')
            ->button()
            ->color('gray');
    }
}
