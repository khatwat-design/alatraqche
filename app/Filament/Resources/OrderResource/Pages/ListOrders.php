<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Filament\Resources\OrderResource;
use App\Services\OrderExportService;
use App\Services\ReportService;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Resources\Pages\ListRecords;

class ListOrders extends ListRecords
{
    protected static string $resource = OrderResource::class;

    protected static ?string $title = 'الطلبات';

    protected function getHeaderActions(): array
    {
        return [
            ActionGroup::make([
                Action::make('export_csv')
                    ->label('CSV (متوافق مع Excel)')
                    ->icon('heroicon-o-table-cells')
                    ->action(fn () => OrderExportService::download($this->getFilteredTableQuery(), 'csv')),
                Action::make('export_json')
                    ->label('JSON')
                    ->icon('heroicon-o-code-bracket')
                    ->action(fn () => OrderExportService::download($this->getFilteredTableQuery(), 'json')),
                Action::make('export_xlsx')
                    ->label('Excel (.xlsx)')
                    ->icon('heroicon-o-document-chart-bar')
                    ->action(fn () => OrderExportService::download($this->getFilteredTableQuery(), 'xlsx')),
                Action::make('export_ods')
                    ->label('LibreOffice (.ods)')
                    ->icon('heroicon-o-document-text')
                    ->action(fn () => OrderExportService::download($this->getFilteredTableQuery(), 'ods')),
                Action::make('export_pdf')
                    ->label('PDF')
                    ->icon('heroicon-o-document-arrow-down')
                    ->action(function () {
                        $query = $this->getFilteredTableQuery();
                        $orders = $query->with('items')->get();
                        $pdf = app(ReportService::class)->ordersReportFromOrders($orders);
                        return response()->streamDownload(function () use ($pdf) {
                            echo $pdf->Output('', 'S');
                        }, 'orders-'.now()->format('Y-m-d').'.pdf', ['Content-Type' => 'application/pdf']);
                    }),
            ])
                ->label('تصدير الطلبات')
                ->icon('heroicon-o-arrow-down-tray')
                ->button()
                ->color('success')
                ->tooltip('يُصدَّر الطلبات الظاهرة حسب الفلاتر الحالية في الجدول.'),
        ];
    }
}
