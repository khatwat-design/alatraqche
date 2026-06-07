@extends('reports.layout')

@section('title', 'تقرير الطلبات')

@section('content')

    {{-- ═══════ SUMMARY ═══════ --}}
    <div class="summary">
        <div class="heading">ملخص الطلبات</div>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="label">إجمالي الطلبات</div>
                <div class="value">{{ $summary['total_orders'] }}</div>
            </div>
            <div class="summary-item">
                <div class="label">إجمالي الإيرادات</div>
                <div class="value">{{ number_format($summary['total_revenue']) }} د.ع</div>
            </div>
            <div class="summary-item">
                <div class="label">إجمالي الخصم</div>
                <div class="value">{{ number_format($summary['total_discount']) }} د.ع</div>
            </div>
            <div class="summary-item">
                <div class="label">متوسط قيمة الطلب</div>
                <div class="value">{{ number_format(round($summary['avg_order_value'])) }} د.ع</div>
            </div>
            <div class="summary-item">
                <div class="label">حسب الحالة</div>
                <div class="value" style="font-size: 11px;">
                    @foreach ($summary['status_breakdown'] as $status => $count)
                        <span class="badge">{{ \App\Helpers\OrderHelper::statusLabelAr($status) }}: {{ $count }}</span>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

    {{-- ═══════ TABLE ═══════ --}}
    <table>
        <thead>
            <tr>
                <th>رقم الفاتورة</th>
                <th>العميل</th>
                <th>الهاتف</th>
                <th>المدينة</th>
                <th>المنتجات</th>
                <th>المجموع</th>
                <th>الخصم</th>
                <th>الإجمالي</th>
                <th>الحالة</th>
                <th>طريقة الدفع</th>
                <th>التاريخ</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($orders as $order)
                <tr>
                    <td style="font-family: monospace; font-size: 9px;">{{ $order->invoice_id }}</td>
                    <td>{{ $order->customer_name }}</td>
                    <td style="font-family: monospace;">{{ $order->customer_phone }}</td>
                    <td>{{ $order->customer_city }}</td>
                    <td style="font-size: 9px;">
                        @foreach ($order->items as $item)
                            {{ $item->name }} ({{ $item->quantity }}×{{ number_format($item->unit_price) }})@if (!$loop->last), @endif
                        @endforeach
                    </td>
                    <td>{{ number_format($order->subtotal) }}</td>
                    <td>{{ number_format($order->discount) }}</td>
                    <td style="font-weight: bold;">{{ number_format($order->total) }}</td>
                    <td><span class="status status-{{ $order->status }}">{{ \App\Helpers\OrderHelper::statusLabelAr($order->status) }}</span></td>
                    <td>{{ $order->payment_method === 'cod' ? 'الدفع عند الاستلام' : $order->payment_method }}</td>
                    <td style="font-size: 9px;">{{ $order->created_at->format('Y-m-d') }}</td>
                </tr>
            @empty
                <tr><td colspan="11" style="text-align: center; padding: 20px; color: #9ca3af;">لا توجد طلبات في هذه الفترة</td></tr>
            @endforelse
        </tbody>
    </table>

@endsection
