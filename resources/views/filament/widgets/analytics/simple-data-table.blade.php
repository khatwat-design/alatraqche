<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">{{ $heading }}</x-slot>
        @if(filled($description ?? null))
            <x-slot name="description">{{ $description }}</x-slot>
        @endif

        <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
            <table class="w-full min-w-[28rem] divide-y divide-gray-200 text-start text-sm dark:divide-white/10">
                <thead class="bg-gray-50 dark:bg-white/5">
                    <tr>
                        @foreach($columns as $i => $col)
                            <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 {{ $i === 0 ? 'text-start' : 'text-end' }}">
                                {{ $col }}
                            </th>
                        @endforeach
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                    @forelse($rows as $idx => $row)
                        <tr class="{{ $idx % 2 === 0 ? '' : 'bg-gray-50/40 dark:bg-white/[0.02]' }} transition-colors hover:bg-primary-50/40 dark:hover:bg-primary-900/10">
                            @foreach($row as $ci => $cell)
                                <td class="px-4 py-2.5 {{ $ci === 0 ? 'font-medium text-gray-900 dark:text-gray-100' : 'tabular-nums text-end text-gray-700 dark:text-gray-300' }}">
                                    {{ $cell }}
                                </td>
                            @endforeach
                        </tr>
                    @empty
                        <tr>
                            <td colspan="{{ count($columns ?? [1]) }}"
                                class="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                                لا توجد بيانات.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
