<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\ProductResource;
use App\Models\Product;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class LowStockProductsTable extends BaseWidget
{
    protected static bool $isDiscovered = false;

    protected static ?string $pollingInterval = '120s';

    protected static ?string $heading = 'منتجات منخفضة المخزون';

    protected static ?string $description = 'ظاهرة في المتجر ومخزونها ≤ ١٠ — راجع الكميات';

    protected static ?int $sort = 7;

    protected int | string | array $columnSpan = [
        'default' => 'full',
        'xl'      => 4,
    ];

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Product::query()
                    ->with('category')
                    ->where('is_visible', true)
                    ->where('stock_qty', '<=', 10)
                    ->orderBy('stock_qty')
            )
            ->paginated(false)
            ->emptyStateHeading('لا يوجد نقص مخزون')
            ->emptyStateDescription('جميع المنتجات الظاهرة فوق عتبة التنبيه.')
            ->columns([
                Tables\Columns\TextColumn::make('name')->label('المنتج')->limit(40)->wrap(),
                Tables\Columns\TextColumn::make('category.name')->label('التصنيف'),
                Tables\Columns\TextColumn::make('stock_qty')
                    ->label('المخزون')
                    ->badge()
                    ->color(fn (int $state): string => $state <= 3 ? 'danger' : 'warning'),
                Tables\Columns\TextColumn::make('price')->label('السعر (د.ع.)')->numeric(),
            ])
            ->actions([
                Tables\Actions\Action::make('edit')
                    ->label('الكتالوج')
                    ->icon('heroicon-m-pencil-square')
                    ->url(ProductResource::getUrl()),
            ]);
    }
}
