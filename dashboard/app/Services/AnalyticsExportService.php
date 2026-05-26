<?php

declare(strict_types=1);

namespace App\Services;

use App\Helpers\OrderHelper;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\ODS\Writer as OdsWriter;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class AnalyticsExportService
{

    public static function downloadCustomerReport(string $format): Response|StreamedResponse
    {
        $base = 'analytics-customers-'.now()->format('Y-m-d_His');

        return match ($format) {
            'csv' => self::streamCsv("{$base}.csv", function ($out): void {
                fwrite($out, "\xEF\xBB\xBF");
                fputcsv($out, ['قسم: العملاء الأكثر طلباً']);
                fputcsv($out, ['الاسم', 'الهاتف', 'عدد الطلبات', 'مجموع المشتريات (د.ع)', 'تاريخ التسجيل']);
                Customer::query()
                    ->whereHas('orders')
                    ->withCount('orders')
                    ->withSum('orders as orders_revenue', 'total')
                    ->orderByDesc('orders_count')
                    ->chunkById(300, function ($chunk) use ($out): void {
                        foreach ($chunk as $c) {
                            fputcsv($out, [
                                $c->name,
                                $c->phone,
                                (string) $c->orders_count,
                                (string) ($c->orders_revenue ?? 0),
                                $c->created_at?->format('Y-m-d H:i:s') ?? '',
                            ]);
                        }
                    });
                fwrite($out, "\n");
                fputcsv($out, ['قسم: الطلبات حسب المدينة / المحافظة']);
                fputcsv($out, ['المدينة (من الطلب)', 'عدد الأشخاص (هواتف مميزة)', 'عدد الطلبات', 'إجمالي المبيعات (د.ع)']);
                foreach (self::cityAggregates() as $row) {
                    fputcsv($out, $row);
                }
            }),
            'json' => response()->streamDownload(function (): void {
                echo json_encode([
                    'generated_at' => now()->toIso8601String(),
                    'top_customers' => Customer::query()
                        ->whereHas('orders')
                        ->withCount('orders')
                        ->withSum('orders as orders_revenue', 'total')
                        ->orderByDesc('orders_count')
                        ->get()
                        ->map(fn (Customer $c) => [
                            'name' => $c->name,
                            'phone' => $c->phone,
                            'orders_count' => $c->orders_count,
                            'orders_revenue' => (int) ($c->orders_revenue ?? 0),
                        ])
                        ->values()
                        ->all(),
                    'orders_by_city' => self::cityAggregatesCollection(),
                ], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
                echo "\n";
            }, $base.'.json', ['Content-Type' => 'application/json; charset=UTF-8']),
            'xlsx', 'ods' => self::spreadsheetCustomer("{$base}.{$format}", $format),
            default => abort(404),
        };
    }

    public static function downloadOrderReport(string $format): Response|StreamedResponse
    {
        $base = 'analytics-orders-'.now()->format('Y-m-d_His');

        return match ($format) {
            'csv' => self::streamCsv("{$base}.csv", function ($out): void {
                fwrite($out, "\xEF\xBB\xBF");
                fputcsv($out, ['قسم: ملخص حسب الحالة']);
                fputcsv($out, ['الحالة', 'عدد الطلبات', 'إجمالي المبيعات (د.ع)']);
                foreach (self::statusAggregates() as $row) {
                    fputcsv($out, $row);
                }
                fwrite($out, "\n");
                fputcsv($out, ['قسم: ملخص حسب القناة']);
                fputcsv($out, ['القناة', 'عدد الطلبات', 'إجمالي المبيعات (د.ع)']);
                foreach (self::channelAggregates() as $row) {
                    fputcsv($out, $row);
                }
            }),
            'json' => response()->streamDownload(function (): void {
                echo json_encode([
                    'generated_at' => now()->toIso8601String(),
                    'by_status' => self::statusAggregatesAssoc(),
                    'by_channel' => self::channelAggregatesAssoc(),
                    'totals' => [
                        'orders' => Order::query()->count(),
                        'revenue' => (int) Order::query()->sum('total'),
                    ],
                ], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)."\n";
            }, $base.'.json', ['Content-Type' => 'application/json; charset=UTF-8']),
            'xlsx', 'ods' => self::spreadsheetOrders("{$base}.{$format}", $format),
            default => abort(404),
        };
    }

    public static function downloadProductCategoryReport(string $format): Response|StreamedResponse
    {
        $base = 'analytics-products-categories-'.now()->format('Y-m-d_His');

        return match ($format) {
            'csv' => self::streamCsv("{$base}.csv", function ($out): void {
                fwrite($out, "\xEF\xBB\xBF");
                fputcsv($out, ['قسم: المنتجات']);
                fputcsv($out, ['معرف المنتج', 'الاسم', 'التصنيف', 'الكمية المباعة', 'الإيراد (د.ع)', 'المخزون']);
                Product::query()
                    ->with('category')
                    ->withSum('orderItems as sold_qty', 'quantity')
                    ->withSum('orderItems as sold_revenue', 'subtotal')
                    ->whereHas('orderItems')
                    ->orderByDesc('sold_qty')
                    ->chunk(200, function ($chunk) use ($out): void {
                        foreach ($chunk as $p) {
                            /** @var Product $p */
                            fputcsv($out, [
                                $p->id,
                                $p->name,
                                $p->category?->name ?? '',
                                (string) ($p->sold_qty ?? 0),
                                (string) ($p->sold_revenue ?? 0),
                                (string) $p->stock_qty,
                            ]);
                        }
                    }, column: 'id');
                fwrite($out, "\n");
                fputcsv($out, ['قسم: التصنيفات']);
                fputcsv($out, ['التصنيف', 'الكمية المباعة', 'الإيراد (د.ع)']);
                foreach (self::categoryAggregatesRows() as $row) {
                    fputcsv($out, $row);
                }
            }),
            'json' => response()->streamDownload(function (): void {
                $products = Product::query()
                    ->with('category:id,name')
                    ->withSum('orderItems as sold_qty', 'quantity')
                    ->withSum('orderItems as sold_revenue', 'subtotal')
                    ->whereHas('orderItems')
                    ->orderByDesc('sold_qty')
                    ->get(['id', 'name', 'category_id', 'stock_qty', 'sold_qty', 'sold_revenue'])
                    ->map(fn (Product $p) => [
                        'id' => $p->id,
                        'name' => $p->name,
                        'category' => $p->category?->name,
                        'sold_qty' => (int) ($p->sold_qty ?? 0),
                        'sold_revenue' => (int) ($p->sold_revenue ?? 0),
                        'stock_qty' => $p->stock_qty,
                    ])->values()->all();

                echo json_encode([
                    'generated_at' => now()->toIso8601String(),
                    'products' => $products,
                    'categories' => self::categoryAggregatesAssoc(),
                ], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)."\n";
            }, $base.'.json', ['Content-Type' => 'application/json; charset=UTF-8']),
            'xlsx', 'ods' => self::spreadsheetProducts("{$base}.{$format}", $format),
            default => abort(404),
        };
    }

    /**
     * @return list<list<string>>
     */
    private static function cityAggregates(): array
    {
        return DB::table('orders')
            ->selectRaw("COALESCE(NULLIF(TRIM(customer_city), ''), 'غير محدد') as city_name")
            ->selectRaw('COUNT(DISTINCT customer_phone) as people_count')
            ->selectRaw('COUNT(*) as orders_count')
            ->selectRaw('COALESCE(SUM(total), 0) as revenue_total')
            ->groupBy('city_name')
            ->orderByDesc('orders_count')
            ->get()
            ->map(fn ($r) => [
                $r->city_name,
                (string) $r->people_count,
                (string) $r->orders_count,
                (string) $r->revenue_total,
            ])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private static function cityAggregatesCollection(): array
    {
        return DB::table('orders')
            ->selectRaw("COALESCE(NULLIF(TRIM(customer_city), ''), 'غير محدد') as city")
            ->selectRaw('COUNT(DISTINCT customer_phone) as people_count')
            ->selectRaw('COUNT(*) as orders_count')
            ->selectRaw('COALESCE(SUM(total), 0) as revenue')
            ->groupBy('city')
            ->orderByDesc('orders_count')
            ->get()
            ->map(fn ($r) => [
                'city' => $r->city,
                'people_count' => (int) $r->people_count,
                'orders_count' => (int) $r->orders_count,
                'revenue' => (int) $r->revenue,
            ])
            ->all();
    }

    /**
     * @return list<list<string>>
     */
    private static function statusAggregates(): array
    {
        return DB::table('orders')
            ->selectRaw('status')
            ->selectRaw('COUNT(*) as c')
            ->selectRaw('COALESCE(SUM(total), 0) as revenue')
            ->groupBy('status')
            ->orderByDesc('c')
            ->get()
            ->map(fn ($r) => [
                OrderHelper::statusLabelAr((string) $r->status),
                (string) $r->c,
                (string) $r->revenue,
            ])
            ->all();
    }

    /**
     * @return list<array{status: string, label_ar: string, orders: int, revenue: int}>
     */
    private static function statusAggregatesAssoc(): array
    {
        return DB::table('orders')
            ->selectRaw('status')
            ->selectRaw('COUNT(*) as c')
            ->selectRaw('COALESCE(SUM(total), 0) as revenue')
            ->groupBy('status')
            ->orderByDesc('c')
            ->get()
            ->map(fn ($r) => [
                'status' => (string) $r->status,
                'label_ar' => OrderHelper::statusLabelAr((string) $r->status),
                'orders' => (int) $r->c,
                'revenue' => (int) $r->revenue,
            ])
            ->all();
    }

    /**
     * @return list<list<string>>
     */
    private static function channelAggregates(): array
    {
        return DB::table('orders')
            ->selectRaw('channel')
            ->selectRaw('COUNT(*) as c')
            ->selectRaw('COALESCE(SUM(total), 0) as revenue')
            ->groupBy('channel')
            ->orderByDesc('c')
            ->get()
            ->map(fn ($r) => [
                (string) ($r->channel ?: '—'),
                (string) $r->c,
                (string) $r->revenue,
            ])
            ->all();
    }

    /**
     * @return list<array{channel: string, orders: int, revenue: int}>
     */
    private static function channelAggregatesAssoc(): array
    {
        return DB::table('orders')
            ->selectRaw('channel')
            ->selectRaw('COUNT(*) as c')
            ->selectRaw('COALESCE(SUM(total), 0) as revenue')
            ->groupBy('channel')
            ->orderByDesc('c')
            ->get()
            ->map(fn ($r) => [
                'channel' => (string) ($r->channel ?? ''),
                'orders' => (int) $r->c,
                'revenue' => (int) $r->revenue,
            ])
            ->all();
    }

    /**
     * @return list<list<string>>
     */
    private static function categoryAggregatesRows(): array
    {
        return DB::table('order_items')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->selectRaw('categories.name as category_name')
            ->selectRaw('SUM(order_items.quantity) as qty')
            ->selectRaw('SUM(order_items.subtotal) as revenue')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($r) => [
                $r->category_name,
                (string) $r->qty,
                (string) $r->revenue,
            ])
            ->all();
    }

    /**
     * @return list<array{name: string, qty: int, revenue: int}>
     */
    private static function categoryAggregatesAssoc(): array
    {
        return DB::table('order_items')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->selectRaw('categories.name as category_name')
            ->selectRaw('SUM(order_items.quantity) as qty')
            ->selectRaw('SUM(order_items.subtotal) as revenue')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($r) => [
                'name' => $r->category_name,
                'qty' => (int) $r->qty,
                'revenue' => (int) $r->revenue,
            ])
            ->all();
    }

    /**
     * @param  callable(resource): void  $writer
     */
    private static function streamCsv(string $filename, callable $writer): StreamedResponse
    {
        return response()->streamDownload(function () use ($writer): void {
            $out = fopen('php://output', 'w');
            if ($out === false) {
                return;
            }
            $writer($out);
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private static function spreadsheetCustomer(string $filename, string $type): Response
    {
        $tmp = tempnam(sys_get_temp_dir(), 'ac');
        if ($tmp === false) {
            abort(500);
        }
        $writer = $type === 'ods' ? new OdsWriter : new XlsxWriter;
        try {
            $writer->openToFile($tmp);
            $writer->getCurrentSheet()->setName('customers');
            $writer->addRow(Row::fromValues(['الاسم', 'الهاتف', 'عدد الطلبات', 'مجموع المشتريات', 'تاريخ التسجيل']));
            Customer::query()
                ->whereHas('orders')
                ->withCount('orders')
                ->withSum('orders as orders_revenue', 'total')
                ->orderByDesc('orders_count')
                ->chunkById(300, function ($chunk) use ($writer): void {
                    foreach ($chunk as $c) {
                        $writer->addRow(Row::fromValues([
                            $c->name,
                            $c->phone,
                            (string) $c->orders_count,
                            (string) ($c->orders_revenue ?? 0),
                            $c->created_at?->format('Y-m-d H:i:s') ?? '',
                        ]));
                    }
                });
            $sheet2 = $writer->addNewSheetAndMakeItCurrent();
            $sheet2->setName('by_city');
            $writer->addRow(Row::fromValues(['المدينة', 'الأشخاص', 'الطلبات', 'المبيعات']));
            foreach (self::cityAggregates() as $row) {
                $writer->addRow(Row::fromValues($row));
            }
            $writer->close();
        } catch (\Throwable $e) {
            @unlink($tmp);
            throw $e;
        }

        return self::binaryDownload($tmp, $filename, $type);
    }

    private static function spreadsheetOrders(string $filename, string $type): Response
    {
        $tmp = tempnam(sys_get_temp_dir(), 'ao');
        if ($tmp === false) {
            abort(500);
        }
        $writer = $type === 'ods' ? new OdsWriter : new XlsxWriter;
        try {
            $writer->openToFile($tmp);
            $writer->getCurrentSheet()->setName('by_status');
            $writer->addRow(Row::fromValues(['الحالة', 'عدد الطلبات', 'المبيعات']));
            foreach (self::statusAggregates() as $row) {
                $writer->addRow(Row::fromValues($row));
            }
            $writer->addNewSheetAndMakeItCurrent()->setName('by_channel');
            $writer->addRow(Row::fromValues(['القناة', 'عدد الطلبات', 'المبيعات']));
            foreach (self::channelAggregates() as $row) {
                $writer->addRow(Row::fromValues($row));
            }
            $writer->close();
        } catch (\Throwable $e) {
            @unlink($tmp);
            throw $e;
        }

        return self::binaryDownload($tmp, $filename, $type);
    }

    private static function spreadsheetProducts(string $filename, string $type): Response
    {
        $tmp = tempnam(sys_get_temp_dir(), 'ap');
        if ($tmp === false) {
            abort(500);
        }
        $writer = $type === 'ods' ? new OdsWriter : new XlsxWriter;
        try {
            $writer->openToFile($tmp);
            $writer->getCurrentSheet()->setName('products');
            $writer->addRow(Row::fromValues(['معرف المنتج', 'الاسم', 'التصنيف', 'كمية مباعة', 'إيراد', 'مخزون']));
            Product::query()
                ->with('category')
                ->withSum('orderItems as sold_qty', 'quantity')
                ->withSum('orderItems as sold_revenue', 'subtotal')
                ->whereHas('orderItems')
                ->orderByDesc('sold_qty')
                ->chunk(200, function ($chunk) use ($writer): void {
                    foreach ($chunk as $p) {
                        /** @var Product $p */
                        $writer->addRow(Row::fromValues([
                            $p->id,
                            $p->name,
                            $p->category?->name ?? '',
                            (string) ($p->sold_qty ?? 0),
                            (string) ($p->sold_revenue ?? 0),
                            (string) $p->stock_qty,
                        ]));
                    }
                }, column: 'id');
            $writer->addNewSheetAndMakeItCurrent()->setName('categories');
            $writer->addRow(Row::fromValues(['التصنيف', 'كمية مباعة', 'إيراد']));
            foreach (self::categoryAggregatesRows() as $row) {
                $writer->addRow(Row::fromValues($row));
            }
            $writer->close();
        } catch (\Throwable $e) {
            @unlink($tmp);
            throw $e;
        }

        return self::binaryDownload($tmp, $filename, $type);
    }

    private static function binaryDownload(string $tmp, string $filename, string $type): Response
    {
        $mime = $type === 'ods'
            ? 'application/vnd.oasis.opendocument.spreadsheet'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        return response()->download($tmp, $filename, [
            'Content-Type' => $mime,
        ])->deleteFileAfterSend(true);
    }
}
