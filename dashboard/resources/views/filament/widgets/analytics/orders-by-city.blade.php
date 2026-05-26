<x-filament-widgets::widget class="fi-wi-orders-by-city">
    <x-filament::section>
        <x-slot name="heading">{{ $heading }}</x-slot>
        @if(filled($description ?? null))
            <x-slot name="description">{{ $description }}</x-slot>
        @endif

        <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
            <table class="w-full min-w-[32rem] divide-y divide-gray-200 text-start text-sm dark:divide-white/10">
                <thead class="bg-gray-50 dark:bg-white/5">
                    <tr>
                        @foreach([
                            'المدينة / المحافظة',
                            'أشخاص (هواتف مميزة)',
                            'عدد الطلبات',
                            'إجمالي المبيعات (د.ع)',
                        ] as $col)
                            <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 first:text-start text-end">
                                {{ $col }}
                            </th>
                        @endforeach
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                    @forelse($rows as $idx => $row)
                        <tr class="{{ $idx % 2 === 0 ? '' : 'bg-gray-50/40 dark:bg-white/[0.02]' }} transition-colors hover:bg-primary-50/40 dark:hover:bg-primary-900/10">
                            <td class="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">{{ $row->city_name }}</td>
                            <td class="px-4 py-2.5 tabular-nums text-end text-gray-700 dark:text-gray-300">{{ number_format($row->people_count) }}</td>
                            <td class="px-4 py-2.5 tabular-nums text-end text-gray-700 dark:text-gray-300">{{ number_format($row->orders_count) }}</td>
                            <td class="px-4 py-2.5 tabular-nums text-end font-medium text-gray-900 dark:text-gray-100">{{ number_format((int) $row->revenue_total) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                                لا توجد بيانات طلبات بعد.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
