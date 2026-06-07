<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\OrderResource;
use App\Models\Order;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentOrdersTable extends BaseWidget
{
    protected static bool $isDiscovered = false;

    protected ?string $pollingInterval = '90s';

    protected static ?string $heading = 'أحدث الطلبات';

    protected ?string $description = 'آخر ١٢ طلباً — اضغط «عرض» للتفاصيل';

    protected static ?int $sort = 5;

    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(Order::query()->latest()->limit(12))
            ->paginated(false)
            ->columns([
                Tables\Columns\TextColumn::make('invoice_id')->label('الفاتورة')->searchable(),
                Tables\Columns\TextColumn::make('customer_name')->label('العميل')->limit(28)->wrap(),
                Tables\Columns\TextColumn::make('customer_phone')->label('الهاتف')->copyable(),
                Tables\Columns\TextColumn::make('total')->label('الإجمالي (د.ع.)')->numeric(),
                Tables\Columns\TextColumn::make('status')
                    ->label('الحالة')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'قيد الانتظار',
                        'confirmed' => 'مؤكد',
                        'processing' => 'قيد التجهيز',
                        'shipped' => 'تم الشحن',
                        'delivered' => 'تم التسليم',
                        'cancelled' => 'ملغى',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'confirmed' => 'info',
                        'processing' => 'info',
                        'shipped' => 'primary',
                        'delivered' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('التاريخ')
                    ->since()
                    ->tooltip(fn (Order $record): string => $record->created_at?->translatedFormat('l j F Y H:i') ?? ''),
            ])
            ->actions([
                Tables\Actions\Action::make('view')
                    ->label('عرض')
                    ->icon('heroicon-m-eye')
                    ->url(fn (Order $record): string => OrderResource::getUrl('view', ['record' => $record])),
            ]);
    }
}
