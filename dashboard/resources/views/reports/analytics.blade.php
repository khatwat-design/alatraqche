@extends('reports.layout')

@section('title', 'التقرير التحليلي')

@section('content')

    {{-- ═══════ KPI ═══════ --}}
    <div class="section">
        <div class="section-title">مؤشرات الأداء الرئيسية</div>
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="label">إجمالي الطلبات</div>
                <div class="value">{{ $totalOrders }}</div>
            </div>
            <div class="kpi-card">
                <div class="label">إجمالي الإيرادات</div>
                <div class="value">{{ number_format($totalRevenue) }} د.ع</div>
            </div>
            <div class="kpi-card">
                <div class="label">متوسط قيمة الطلب</div>
                <div class="value">{{ number_format($avgOrderValue) }} د.ع</div>
            </div>
            <div class="kpi-card">
                <div class="label">إجمالي الخصم</div>
                <div class="value">{{ number_format($totalDiscount) }} د.ع</div>
            </div>
        </div>
    </div>

    {{-- ═══════ ORDERS BY STATUS ═══════ --}}
    <div class="section">
        <div class="section-title">الطلبات حسب الحالة</div>
        <table>
            <thead>
                <tr>
                    <th>الحالة</th>
                    <th>العدد</th>
                    <th>الإيرادات</th>
                    <th>النسبة</th>
                </tr>
            </thead>
            <tbody>
                @php $maxCount = $ordersByStatus->max('count') ?: 1; @endphp
                @foreach ($ordersByStatus as $row)
                    <tr>
                        <td>{{ \App\Helpers\OrderHelper::statusLabelAr($row->status) }}</td>
                        <td style="font-weight: bold;">{{ $row->count }}</td>
                        <td>{{ number_format($row->revenue) }} د.ع</td>
                        <td>
                            <div class="bar"><div class="bar-fill" style="width: {{ ($row->count / $maxCount) * 100 }}%;"></div></div>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    {{-- ═══════ TOP PRODUCTS ═══════ --}}
    <div class="section">
        <div class="section-title">المنتجات الأكثر مبيعاً</div>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>المنتج</th>
                    <th>التصنيف</th>
                    <th>الكمية المباعة</th>
                    <th>الإيرادات</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($topProducts as $i => $product)
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td>{{ $product->name }}</td>
                        <td>{{ $product->category?->name ?? '—' }}</td>
                        <td style="font-weight: bold;">{{ (int) $product->total_sold }}</td>
                        <td>{{ number_format((int) $product->total_revenue) }} د.ع</td>
                    </tr>
                @empty
                    <tr><td colspan="5" style="text-align: center; color: #9ca3af;">لا توجد مبيعات</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- ═══════ BY CITY ═══════ --}}
    <div class="section">
        <div class="section-title">المبيعات حسب المدينة</div>
        <table>
            <thead>
                <tr>
                    <th>المدينة</th>
                    <th>عدد الطلبات</th>
                    <th>الإيرادات</th>
                    <th>النسبة</th>
                </tr>
            </thead>
            <tbody>
                @php $maxCity = $ordersByCity->max('count') ?: 1; @endphp
                @forelse ($ordersByCity as $row)
                    <tr>
                        <td>{{ $row->customer_city }}</td>
                        <td style="font-weight: bold;">{{ $row->count }}</td>
                        <td>{{ number_format($row->revenue) }} د.ع</td>
                        <td>
                            <div class="bar"><div class="bar-fill" style="width: {{ ($row->count / $maxCity) * 100 }}%;"></div></div>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="4" style="text-align: center; color: #9ca3af;">لا توجد مبيعات</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- ═══════ REVENUE TREND ═══════ --}}
    <div class="section">
        <div class="section-title">الإيرادات اليومية</div>
        <table>
            <thead>
                <tr>
                    <th>التاريخ</th>
                    <th>عدد الطلبات</th>
                    <th>الإيرادات</th>
                    <th>الاتجاه</th>
                </tr>
            </thead>
            <tbody>
                @php $maxRev = $revenueByDay->max('revenue') ?: 1; @endphp
                @forelse ($revenueByDay as $day)
                    <tr>
                        <td>{{ $day->date }}</td>
                        <td>{{ $day->orders_count }}</td>
                        <td style="font-weight: bold;">{{ number_format($day->revenue) }} د.ع</td>
                        <td>
                            <div class="bar"><div class="bar-fill" style="width: {{ ($day->revenue / $maxRev) * 100 }}%;"></div></div>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="4" style="text-align: center; color: #9ca3af;">لا توجد إيرادات في هذه الفترة</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    {{-- ═══════ BY CATEGORY ═══════ --}}
    <div class="section">
        <div class="section-title">المبيعات حسب التصنيف</div>
        <table>
            <thead>
                <tr>
                    <th>التصنيف</th>
                    <th>الكمية المباعة</th>
                    <th>النسبة</th>
                </tr>
            </thead>
            <tbody>
                @php $maxCat = $categorySales->max('total_sold') ?: 1; @endphp
                @forelse ($categorySales as $cat)
                    <tr>
                        <td>{{ $cat->name }}</td>
                        <td style="font-weight: bold;">{{ (int) $cat->total_sold }}</td>
                        <td>
                            <div class="bar"><div class="bar-fill" style="width: {{ ($cat->total_sold / $maxCat) * 100 }}%;"></div></div>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="3" style="text-align: center; color: #9ca3af;">لا توجد مبيعات</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

@endsection
