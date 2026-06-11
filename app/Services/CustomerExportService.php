<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\ODS\Writer as OdsWriter;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class CustomerExportService
{
    private static function headerLabels(): array
    {
        return [
            'الاسم',
            'الهاتف',
            'البريد',
            'عدد الطلبات',
            'إجمالي المشتريات',
            'ملاحظات',
            'تاريخ التسجيل',
            'آخر تحديث',
        ];
    }

    private static function flatRow(Customer $customer): array
    {
        return [
            $customer->name,
            $customer->phone ?? '',
            $customer->email ?? '',
            (string) ($customer->orders_count ?? $customer->orders()->count()),
            (string) ($customer->total_spent ?? $customer->orders()->where('status', '!=', 'cancelled')->sum('total')),
            $customer->notes ?? '',
            $customer->created_at?->format('Y-m-d H:i:s') ?? '',
            $customer->updated_at?->format('Y-m-d H:i:s') ?? '',
        ];
    }

    private static function customerToJsonArray(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'email' => $customer->email,
            'orders_count' => $customer->orders_count ?? $customer->orders()->count(),
            'total_spent' => (float) ($customer->total_spent ?? $customer->orders()->where('status', '!=', 'cancelled')->sum('total')),
            'notes' => $customer->notes,
            'created_at' => $customer->created_at?->toIso8601String(),
            'updated_at' => $customer->updated_at?->toIso8601String(),
        ];
    }

    public static function download(Builder $query, string $format): Response|StreamedResponse
    {
        $base = 'customers-export-'.now()->format('Y-m-d_His');

        return match ($format) {
            'csv' => self::csv($query->clone(), "{$base}.csv"),
            'json' => self::json($query->clone(), "{$base}.json"),
            'xlsx' => self::spreadsheet($query->clone(), "{$base}.xlsx", 'xlsx'),
            'ods' => self::spreadsheet($query->clone(), "{$base}.ods", 'ods'),
            default => abort(404),
        };
    }

    private static function csv(Builder $query, string $filename): StreamedResponse
    {
        $headers = self::headerLabels();

        return response()->streamDownload(function () use ($query, $headers): void {
            $out = fopen('php://output', 'w');
            if ($out === false) {
                return;
            }
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $headers);
            $query->chunkByIdDesc(200, function ($customers) use ($out): void {
                foreach ($customers as $customer) {
                    fputcsv($out, self::flatRow($customer));
                }
            });
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private static function json(Builder $query, string $filename): StreamedResponse
    {
        return response()->streamDownload(function () use ($query): void {
            if (! $query->clone()->exists()) {
                echo "[]\n";
                return;
            }
            echo "[\n";
            $first = true;
            $query->chunkByIdDesc(200, function ($customers) use (&$first): void {
                foreach ($customers as $customer) {
                    if (! $first) {
                        echo ",\n";
                    }
                    $first = false;
                    echo json_encode(
                        self::customerToJsonArray($customer),
                        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
                    );
                }
            });
            echo "\n]\n";
        }, $filename, [
            'Content-Type' => 'application/json; charset=UTF-8',
        ]);
    }

    private static function spreadsheet(Builder $query, string $filename, string $type): Response
    {
        $tmp = tempnam(sys_get_temp_dir(), 'custexp');
        if ($tmp === false) {
            abort(500, 'تعذر إنشاء ملف مؤقت للتصدير.');
        }

        $writer = $type === 'ods' ? new OdsWriter : new XlsxWriter;

        try {
            $writer->openToFile($tmp);
            $writer->getCurrentSheet()->setName('العملاء');
            $writer->addRow(Row::fromValues(self::headerLabels()));

            $query->chunkByIdDesc(200, function ($customers) use ($writer): void {
                foreach ($customers as $customer) {
                    $writer->addRow(Row::fromValues(self::flatRow($customer)));
                }
            });
            $writer->close();
        } catch (\Throwable $e) {
            @unlink($tmp);
            throw $e;
        }

        $mime = $type === 'ods'
            ? 'application/vnd.oasis.opendocument.spreadsheet'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        return response()->download($tmp, $filename, [
            'Content-Type' => $mime,
        ])->deleteFileAfterSend(true);
    }
}
