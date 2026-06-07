<x-mail::message>
# مرحباً {{ $order->customer_name }}

تم تحديث حالة طلبك **#{{ $order->invoice_id }}**

<x-mail::panel>
**الحالة:** {{ $statusLabel }}
</x-mail::panel>

### تفاصيل الطلب
- **رقم الفاتورة:** {{ $order->invoice_id }}
- **المجموع:** {{ number_format($order->total) }} دينار
- **عدد القطع:** {{ $order->total_items }}

<x-mail::button :url="url('/my/orders/'.$order->invoice_id)">
عرض الطلب
</x-mail::button>

شكراً لتسوقك من الأطرقجي،<br>
فريق **{{ config('app.name') }}**
</x-mail::message>
