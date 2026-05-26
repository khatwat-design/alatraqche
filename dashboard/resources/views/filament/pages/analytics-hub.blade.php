<x-filament-panels::page>
    <x-filament-widgets::widgets
        :widgets="$this->getVisibleHeaderWidgets()"
        :columns="$this->getHeaderWidgetsColumns()"
        :data="$this->getWidgetData()"
    />
</x-filament-panels::page>
