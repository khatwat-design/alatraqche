<?php

namespace App\Filament\Pages;

use App\Models\StoreSetting;
use Filament\Pages\Dashboard;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\Carbon;

class ControlPanel extends Dashboard
{
    protected static ?string $navigationIcon = 'heroicon-o-chart-bar-square';

    protected static ?string $navigationLabel = 'لوحة القيادة';

    protected static ?string $title = 'لوحة القيادة';

    protected static ?int $navigationSort = -100;

    public function getTitle(): string | Htmlable
    {
        $name = StoreSetting::current()->store_name;

        return 'لوحة القيادة — '.$name;
    }

    public function getSubheading(): string | Htmlable | null
    {
        return 'ملخص الأداء — '.Carbon::now()->translatedFormat('l، j F Y، H:i');
    }

    public function getColumns(): int | string | array
    {
        return 12;
    }
}
