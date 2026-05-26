<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\ProductResource;
use App\Models\Product;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class TopSellingProductsTable extends BaseWidget
{
    protected static bool $isDiscovered = false;

    protected static ?string $pollingInterval = '120s';

    protected static ?string $heading = 'الأكثر مبيعاً';

    protected static ?string $description = 'حسب مجموع الكميات في بنود الطلبات (معرّف المنتج)';

    protected static ?int $sort = 6;

    protected int | string | array $columnSpan = [
        'default' => 'full',
        'xl'      => 8,
    ];

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Product::query()
                    ->with('category')
                    ->withSum('orderItems as sold_total', 'quantity')
                    ->whereHas('orderItems')
                    ->orderByDesc('sold_total')
                    ->limit(10)
            )
            ->paginated(false)
            ->emptyStateHeading('لا توجد مبيعات بعد')
            ->emptyStateDescription('عند تسجيل طلبات تحتوي على منتجات، ستظهر هنا الأكثر طلباً.')
            ->columns([
                Tables\Columns\TextColumn::make('name')->label('المنتج')->limit(36)->wrap(),
                Tables\Columns\TextColumn::make('category.name')->label('التصنيف'),
                Tables\Columns\TextColumn::make('sold_total')
                    ->label('القطع المباعة')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('stock_qty')->label('المخزون الحالي')->numeric(),
            ])
            ->actions([
                Tables\Actions\Action::make('catalog')
                    ->label('الكتالوج')
                    ->icon('heroicon-m-cube')
                    ->url(ProductResource::getUrl()),
            ]);
    }
}
