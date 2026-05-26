<?php

declare(strict_types=1);

namespace App\Filament\Widgets\Analytics;

use App\Filament\Resources\ProductResource;
use App\Models\Product;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class TopProductsAnalyticsTableWidget extends BaseWidget
{
    protected static bool $isDiscovered = false;

    protected static ?string $heading = 'المنتجات حسب المبيعات';

    protected static ?string $description = 'الكمية المباعة والإيراد من بنود الطلبات';

    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Product::query()
                    ->with('category')
                    ->withSum('orderItems as sold_qty', 'quantity')
                    ->withSum('orderItems as sold_revenue', 'subtotal')
                    ->whereHas('orderItems')
                    ->orderByDesc('sold_qty')
            )
            ->paginated([10, 25, 50])
            ->defaultPaginationPageOption(25)
            ->emptyStateHeading('لا مبيعات مسجّلة')
            ->columns([
                Tables\Columns\TextColumn::make('name')->label('المنتج')->limit(40)->wrap()->searchable(),
                Tables\Columns\TextColumn::make('category.name')->label('التصنيف'),
                Tables\Columns\TextColumn::make('sold_qty')->label('الكمية المباعة')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('sold_revenue')->label('الإيراد (د.ع)')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('stock_qty')->label('المخزون')->numeric(),
            ])
            ->actions([
                Tables\Actions\Action::make('catalog')
                    ->label('الكتالوج')
                    ->icon('heroicon-m-cube')
                    ->url(ProductResource::getUrl()),
            ]);
    }
}
