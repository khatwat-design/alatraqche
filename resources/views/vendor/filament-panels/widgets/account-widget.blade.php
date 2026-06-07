@php
    $user = filament()->auth()->user();
@endphp

<x-filament-widgets::widget class="fi-account-widget">
    <x-filament::section>
        <div
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
            <div class="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                <div class="shrink-0">
                    <x-filament-panels::avatar.user size="md" :user="$user" />
                </div>

                <div class="min-w-0 flex-1">
                    <h2
                        class="text-base font-semibold leading-6 text-gray-950 dark:text-white sm:text-lg sm:leading-7"
                    >
                        {{ __('filament-panels::widgets/account-widget.welcome', ['app' => config('app.name')]) }}
                    </h2>

                    <p
                        class="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400 sm:text-base"
                        title="{{ filament()->getUserName($user) }}"
                    >
                        {{ filament()->getUserName($user) }}
                    </p>
                </div>
            </div>

            <form
                action="{{ filament()->getLogoutUrl() }}"
                method="post"
                class="w-full shrink-0 sm:w-auto sm:ms-2"
            >
                @csrf

                <x-filament::button
                    color="gray"
                    icon="heroicon-m-arrow-left-on-rectangle"
                    icon-alias="panels::widgets.account.logout-button"
                    labeled-from="md"
                    tag="button"
                    type="submit"
                >
                    {{ __('filament-panels::widgets/account-widget.actions.logout.label') }}
                </x-filament::button>
            </form>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
