<div class="-mx-6 mt-4 border-t border-gray-200 px-6 pb-2 pt-4 dark:border-white/10">
    <form method="post" action="{{ filament()->getLogoutUrl() }}" class="w-full">
        @csrf

        <x-filament::button
            type="submit"
            color="gray"
            icon="heroicon-m-arrow-left-on-rectangle"
            class="w-full justify-center"
        >
            {{ __('filament-panels::layout.actions.logout.label') }}
        </x-filament::button>
    </form>
</div>
