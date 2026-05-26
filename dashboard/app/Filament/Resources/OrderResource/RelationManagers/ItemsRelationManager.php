<?php

namespace App\Filament\Resources\OrderResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'items';

    protected static ?string $title = 'بنود الطلب';

    public function isReadOnly(): bool
    {
        return true;
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                Tables\Columns\TextColumn::make('name')->label('المنتج')->wrap(),
                Tables\Columns\TextColumn::make('quantity')->label('الكمية'),
                Tables\Columns\TextColumn::make('unit_price')->label('سعر الوحدة')->numeric(),
                Tables\Columns\TextColumn::make('subtotal')->label('المجموع')->numeric(),
            ])
            ->headerActions([])
            ->actions([])
            ->bulkActions([]);
    }
}
