<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ReportDownloadController extends Controller
{
    public function orders(Request $request, ReportService $reportService)
    {
        $pdf = $reportService->ordersReport(
            $request->query('from'),
            $request->query('to'),
            $request->query('status'),
        );

        return response()->streamDownload(function () use ($pdf) {
            echo $pdf->Output('', 'S');
        }, 'Alatraqche-Orders-'.now()->format('Y-m-d').'.pdf', ['Content-Type' => 'application/pdf']);
    }

    public function customers(Request $request, ReportService $reportService)
    {
        $pdf = $reportService->customersReport(
            $request->query('from'),
            $request->query('to'),
            $request->query('sort_by', 'orders_count'),
        );

        return response()->streamDownload(function () use ($pdf) {
            echo $pdf->Output('', 'S');
        }, 'Alatraqche-Customers-'.now()->format('Y-m-d').'.pdf', ['Content-Type' => 'application/pdf']);
    }

    public function analytics(Request $request, ReportService $reportService)
    {
        $pdf = $reportService->analyticsReport(
            $request->query('from'),
            $request->query('to'),
        );

        return response()->streamDownload(function () use ($pdf) {
            echo $pdf->Output('', 'S');
        }, 'Alatraqche-Analytics-'.now()->format('Y-m-d').'.pdf', ['Content-Type' => 'application/pdf']);
    }
}
