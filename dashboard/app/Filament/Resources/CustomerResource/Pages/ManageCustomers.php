<?php

namespace App\Filament\Resources\CustomerResource\Pages;

use App\Filament\Resources\CustomerResource;
use App\Services\ReportService;
use Filament\Actions;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Resources\Pages\ManageRecords;

class ManageCustomers extends ManageRecords
{
    protected static string $resource = CustomerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ActionGroup::make([
                Action::make('export_customers_pdf')
                    ->label('PDF')
                    ->icon('heroicon-o-document-arrow-down')
                    ->action(function () {
                        $query = $this->getTable()->getQuery();
                        $customers = $query->withCount('orders')->withSum('orders', 'total')->get();
                        $pdf = app(ReportService::class)->customersReportFromCustomers($customers);
                        return response()->streamDownload(function () use ($pdf) {
                            echo $pdf->Output('', 'S');
                        }, 'customers-'.now()->format('Y-m-d').'.pdf', ['Content-Type' => 'application/pdf']);
                    }),
            ])
                ->label('تصدير العملاء')
                ->icon('heroicon-o-arrow-down-tray')
                ->button()
                ->color('warning'),
            Actions\CreateAction::make(),
        ];
    }
}
