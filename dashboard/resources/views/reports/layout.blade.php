<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>@yield('title') - {{ $store->store_name ?? 'الأطرقجي' }}</title>
    <style>
        @page { margin: 25px; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            color: #374151;
            line-height: 1.6;
        }

        /* ── HEADER ── */
        .report-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 15px;
            border-bottom: 3px solid #d97706;
            margin-bottom: 20px;
        }
        .report-header .brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .report-header .brand img {
            max-height: 55px;
            max-width: 180px;
        }
        .report-header .brand .store-name {
            font-size: 16px;
            font-weight: bold;
            color: #d97706;
        }
        .report-header .meta {
            text-align: left;
            direction: ltr;
        }
        .report-header .meta .title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            direction: rtl;
            text-align: right;
        }
        .report-header .meta .sub {
            font-size: 9px;
            color: #6b7280;
            direction: rtl;
            text-align: right;
        }

        /* ── SUMMARY / KPI ── */
        .summary {
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 14px 16px;
            margin-bottom: 20px;
        }
        .summary .heading {
            font-size: 11px;
            font-weight: bold;
            color: #92400e;
            margin: 0 0 10px;
        }
        .summary-grid {
            display: flex;
            gap: 14px;
            flex-wrap: wrap;
        }
        .summary-item {
            flex: 1;
            min-width: 110px;
        }
        .summary-item .label {
            font-size: 8px;
            color: #92400e;
            margin-bottom: 2px;
        }
        .summary-item .value {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
        }

        /* ── SECTION ── */
        .section {
            margin-bottom: 22px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #d97706;
            border-bottom: 2px solid #d97706;
            padding-bottom: 4px;
            margin: 0 0 10px;
        }

        /* ── KPI CARDS (Analytics) ── */
        .kpi-grid {
            display: flex;
            gap: 12px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        .kpi-card {
            flex: 1;
            min-width: 120px;
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
        }
        .kpi-card .label {
            font-size: 9px;
            color: #92400e;
        }
        .kpi-card .value {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
        }

        /* ── TABLES ── */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
            font-size: 9px;
        }
        th {
            background: #d97706;
            color: #fff;
            padding: 8px 6px;
            font-size: 9px;
            text-align: center;
            font-weight: bold;
        }
        td {
            padding: 6px;
            border-bottom: 1px solid #e5e7eb;
            text-align: center;
        }
        tr:nth-child(even) td {
            background: #fefce8;
        }

        /* ── STATUS BADGES ── */
        .status {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: bold;
        }
        .status-pending    { background: #fef3c7; color: #92400e; }
        .status-confirmed  { background: #dbeafe; color: #1e40af; }
        .status-processing { background: #e0e7ff; color: #3730a3; }
        .status-shipped    { background: #ede9fe; color: #5b21b6; }
        .status-delivered  { background: #d1fae5; color: #065f46; }
        .status-cancelled  { background: #fee2e2; color: #991b1b; }
        .status-returned   { background: #fce7f3; color: #9d174d; }

        /* ── BARS ── */
        .bar {
            height: 12px;
            background: #fde68a;
            border-radius: 6px;
            overflow: hidden;
        }
        .bar-fill {
            height: 100%;
            background: #d97706;
            border-radius: 6px;
        }

        /* ── BADGE ── */
        .badge {
            background: #fef3c7;
            padding: 1px 5px;
            border-radius: 4px;
            font-size: 8px;
            color: #92400e;
        }

        /* ── FOOTER ── */
        .report-footer {
            margin-top: 25px;
            padding-top: 10px;
            border-top: 2px solid #d97706;
            text-align: center;
            font-size: 8px;
            color: #9ca3af;
        }
        .page-number {
            position: fixed;
            bottom: 10px;
            left: 10px;
            font-size: 8px;
            color: #9ca3af;
        }
    </style>
</head>
<body>

    {{-- ═══════ HEADER ═══════ --}}
    <div class="report-header">
        <div class="brand">
            @php
                $logoFile = public_path('images/alatraqji-logo.png');
            @endphp
            @if (file_exists($logoFile))
                <img src="{{ $logoFile }}" alt="{{ $store->store_name }}">
            @else
                <div class="store-name">{{ $store->store_name ?? 'الأطرقجي' }}</div>
            @endif
        </div>
        <div class="meta">
            <div class="title">@yield('title')</div>
            <div class="sub">{{ $store->store_name ?? 'الأطرقجي للسجاد والأثاث والمفروشات' }}</div>
            <div class="sub">
                {{ $store->address_line ?? 'بغداد' }} |
                {{ $store->phone_primary ?? '—' }}
            </div>
            <div class="sub">تاريخ التقرير: {{ $generatedAt ?? now()->translatedFormat('j F Y H:i') }}</div>
            @if (isset($from) || isset($to))
                <div class="sub">
                    الفترة:
                    @if (!empty($from)) من {{ $from }} @endif
                    @if (!empty($to)) إلى {{ $to }} @endif
                </div>
            @endif
        </div>
    </div>

    {{-- ═══════ CONTENT ═══════ --}}
    @yield('content')

    {{-- ═══════ FOOTER ═══════ --}}
    <div class="report-footer">
        تم إنشاؤه بواسطة {{ $store->store_name ?? 'الأطرقجي' }} |
        جميع الحقوق محفوظة &copy; {{ date('Y') }}
    </div>
    <div class="page-number">الصفحة 1</div>

</body>
</html>
