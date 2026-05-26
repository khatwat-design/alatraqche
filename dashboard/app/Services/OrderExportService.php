<?php

declare(strict_types=1);

namespace App\Services;

use App\Helpers\OrderHelper;
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\ODS\Writer as OdsWriter;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class OrderExportService
{
    /** @return list<string> */
    private static function headerLabels(): array
    {
        return [
            'رقم الفاتورة',
            'الحالة',
            'اسم العميل',
            'الهاتف',
            'المدينة',
            'العنوان',
            'الطابق / المدخل',
            'وقت التوصيل المفضل',
            'طريقة الدفع',
            'ملاحظات',
            'المجموع الفرعي',
            'التوصيل',
            'الإجمالي',
            'عدد القطع',
            'القناة',
            'عناصر الطلب',
            'تاريخ الإنشاء',
            'آخر تحديث',
        ];
    }

    /**
     * @param  Builder<Order>  $query
     * @return list<string|int|null>
     */
    private static function flatRow(Order $order): array
    {
        return [
            $order->invoice_id,
            OrderHelper::statusLabelAr((string) $order->status),
            $order->customer_name,
            $order->customer_phone,
            $order->customer_city,
            $order->customer_address,
            $order->floor_note,
            $order->delivery_time_note,
            $order->payment_method,
            $order->notes,
            (string) $order->subtotal,
            (string) $order->delivery_fee,
            (string) $order->total,
            (string) $order->total_items,
            $order->channel,
            self::itemsSummary($order),
            $order->created_at instanceof Carbon ? $order->created_at->format('Y-m-d H:i:s') : '',
            $order->updated_at instanceof Carbon ? $order->updated_at->format('Y-m-d H:i:s') : '',
        ];
    }

    private static function itemsSummary(Order $order): string
    {
        if (! $order->relationLoaded('items')) {
            $order->load('items');
        }

        return $order->items
            ->map(fn ($item) => "{$item->name} ×{$item->quantity} ({$item->subtotal})")
            ->implode(' | ');
    }

    /**
     * @return array<string, mixed>
     */
    private static function orderToJsonArray(Order $order): array
    {
        if (! $order->relationLoaded('items')) {
            $order->load('items');
        }

        return [
            'id' => $order->id,
            'invoice_id' => $order->invoice_id,
            'status' => $order->status,
            'status_label_ar' => self::statusLabelAr((string) $order->status),
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'customer_city' => $order->customer_city,
            'customer_address' => $order->customer_address,
            'floor_note' => $order->floor_note,
            'delivery_time_note' => $order->delivery_time_note,
            'notes' => $order->notes,
            'payment_method' => $order->payment_method,
            'subtotal' => $order->subtotal,
            'delivery_fee' => $order->delivery_fee,
            'total' => $order->total,
            'total_items' => $order->total_items,
            'channel' => $order->channel,
            'created_at' => $order->created_at?->toIso8601String(),
            'updated_at' => $order->updated_at?->toIso8601String(),
            'items' => $order->items->map(fn ($i) => [
                'product_id' => $i->product_id,
                'name' => $i->name,
                'quantity' => $i->quantity,
                'unit_price' => $i->unit_price,
                'subtotal' => $i->subtotal,
            ])->values()->all(),
        ];
    }

    /**
     * @param  Builder<Order>  $query
     */
    public static function download(Builder $query, string $format): Response|StreamedResponse
    {
        $base = 'orders-export-'.now()->format('Y-m-d_His');

        return match ($format) {
            'csv' => self::csv($query->clone(), "{$base}.csv"),
            'json' => self::json($query->clone(), "{$base}.json"),
            'xlsx' => self::spreadsheet($query->clone(), "{$base}.xlsx", 'xlsx'),
            'ods' => self::spreadsheet($query->clone(), "{$base}.ods", 'ods'),
            default => abort(404),
        };
    }

    /**
     * @param  Builder<Order>  $query
     */
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
            $query->with('items')->chunkByIdDesc(200, function ($orders) use ($out): void {
                foreach ($orders as $order) {
                    /** @var Order $order */
                    fputcsv($out, self::flatRow($order));
                }
            });
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @param  Builder<Order>  $query
     */
    private static function json(Builder $query, string $filename): StreamedResponse
    {
        return response()->streamDownload(function () use ($query): void {
            if (! $query->clone()->exists()) {
                echo "[]\n";

                return;
            }
            echo "[\n";
            $first = true;
            $query->with('items')->chunkByIdDesc(200, function ($orders) use (&$first): void {
                foreach ($orders as $order) {
                    /** @var Order $order */
                    if (! $first) {
                        echo ",\n";
                    }
                    $first = false;
                    echo json_encode(
                        self::orderToJsonArray($order),
                        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
                    );
                }
            });
            echo "\n]\n";
        }, $filename, [
            'Content-Type' => 'application/json; charset=UTF-8',
        ]);
    }

    /**
     * @param  Builder<Order>  $query
     */
    private static function spreadsheet(Builder $query, string $filename, string $type): Response
    {
        $tmp = tempnam(sys_get_temp_dir(), 'ordexp');
        if ($tmp === false) {
            abort(500, 'تعذر إنشاء ملف مؤقت للتصدير.');
        }

        $writer = $type === 'ods' ? new OdsWriter : new XlsxWriter;

        try {
            $writer->openToFile($tmp);
            $writer->getCurrentSheet()->setName('Orders');
            $writer->addRow(Row::fromValues(self::headerLabels()));

            $query->with('items')->chunkByIdDesc(200, function ($orders) use ($writer): void {
                foreach ($orders as $order) {
                    /** @var Order $order */
                    $writer->addRow(Row::fromValues(self::flatRow($order)));
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
