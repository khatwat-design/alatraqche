@extends('reports.layout')

@section('title', 'تقرير العملاء')

@section('content')

    {{-- ═══════ SUMMARY ═══════ --}}
    <div class="summary">
        <div class="heading">ملخص العملاء</div>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="label">إجمالي العملاء</div>
                <div class="value">{{ $summary['total_customers'] }}</div>
            </div>
            <div class="summary-item">
                <div class="label">عملاء لديهم طلبات</div>
                <div class="value">{{ $summary['customers_with_orders'] }}</div>
            </div>
            <div class="summary-item">
                <div class="label">إجمالي الإيرادات</div>
                <div class="value">{{ number_format($summary['total_revenue']) }} د.ع</div>
            </div>
            <div class="summary-item">
                <div class="label">متوسط الإنفاق لكل عميل</div>
                <div class="value">{{ number_format(round($summary['avg_per_customer'])) }} د.ع</div>
            </div>
        </div>
    </div>

    {{-- ═══════ TABLE ═══════ --}}
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>الاسم</th>
                <th>الهاتف</th>
                <th>البريد الإلكتروني</th>
                <th>عدد الطلبات</th>
                <th>إجمالي المشتريات</th>
                <th>متوسط قيمة الطلب</th>
                <th>آخر طلب</th>
                <th>تاريخ التسجيل</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($customers as $i => $customer)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $customer->name }}</td>
                    <td style="font-family: monospace;">{{ $customer->phone }}</td>
                    <td>{{ $customer->email ?? '—' }}</td>
                    <td style="font-weight: bold;">{{ $customer->orders_count }}</td>
                    <td style="font-weight: bold;">{{ number_format((int) $customer->orders_sum_total) }} د.ع</td>
                    <td>{{ $customer->orders_count > 0 ? number_format(round($customer->orders_sum_total / $customer->orders_count)) : 0 }} د.ع</td>
                    <td style="font-size: 9px;">{{ $customer->orders()->latest()->first()?->created_at?->format('Y-m-d') ?? '—' }}</td>
                    <td style="font-size: 9px;">{{ $customer->created_at->format('Y-m-d') }}</td>
                </tr>
            @empty
                <tr><td colspan="9" style="text-align: center; padding: 20px; color: #9ca3af;">لا يوجد عملاء</td></tr>
            @endforelse
        </tbody>
    </table>

@endsection
