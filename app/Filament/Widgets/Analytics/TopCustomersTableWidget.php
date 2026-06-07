<?php

declare(strict_types=1);

namespace App\Filament\Widgets\Analytics;

use App\Filament\Resources\CustomerResource;
use App\Models\Customer;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class TopCustomersTableWidget extends BaseWidget
{
    protected static bool $isDiscovered = false;

    protected static ?string $heading = 'العملاء الأكثر طلباً';

    protected ?string $description = 'عدد الطلبات ومجموع المشتريات لكل عميل مسجّل في قسم العملاء';

    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Customer::query()
                    ->whereHas('orders')
                    ->withCount('orders')
                    ->withSum('orders as orders_revenue', 'total')
                    ->orderByDesc('orders_count')
            )
            ->paginated([10, 25, 50, 100])
            ->defaultPaginationPageOption(25)
            ->emptyStateHeading('لا يوجد عملاء بطلبات بعد')
            ->emptyStateDescription('عند تسجيل طلبات مرتبطة بعملاء، ستظهر الإحصائيات هنا.')
            ->columns([
                Tables\Columns\TextColumn::make('name')->label('الاسم')->searchable()->wrap(),
                Tables\Columns\TextColumn::make('phone')->label('الهاتف')->searchable(),
                Tables\Columns\TextColumn::make('orders_count')
                    ->label('عدد الطلبات')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('orders_revenue')
                    ->label('مجموع المشتريات (د.ع)')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')->label('أُضيف كعميل')->dateTime('Y-m-d')->toggleable(isToggledHiddenByDefault: true),
            ])
            ->actions([
                Tables\Actions\Action::make('open')
                    ->label('قائمة العملاء')
                    ->icon('heroicon-m-users')
                    ->url(CustomerResource::getUrl()),
            ]);
    }
}
