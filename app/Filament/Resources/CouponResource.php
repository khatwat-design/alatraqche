<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CouponResource\Pages;
use App\Models\Coupon;
use Filament\Forms;
use Filament\Schemas\Schema as Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CouponResource extends Resource
{
    protected static ?string $model = Coupon::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-ticket';

    protected static ?string $navigationLabel = 'كوبونات الخصم';

    protected static ?string $modelLabel = 'كوبون';

    protected static ?string $pluralModelLabel = 'كوبونات الخصم';

    protected static string | \UnitEnum | null $navigationGroup = 'المتجر';

    protected static ?int $navigationSort = 6;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('code')
                    ->label('كود الخصم')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(50),
                Forms\Components\Select::make('type')
                    ->label('نوع الخصم')
                    ->options([
                        'fixed' => 'ثابت (مبلغ)',
                        'percentage' => 'نسبة مئوية',
                    ])
                    ->required(),
                Forms\Components\TextInput::make('value')
                    ->label(function ($get) {
                        return $get('type') === 'percentage' ? 'النسبة (%)' : 'المبلغ (دينار)';
                    })
                    ->numeric()
                    ->required()
                    ->minValue(0),
                Forms\Components\TextInput::make('min_order_amount')
                    ->label('الحد الأدنى للطلب')
                    ->numeric()
                    ->minValue(0)
                    ->placeholder('اختياري'),
                Forms\Components\TextInput::make('max_discount')
                    ->label('الحد الأقصى للخصم')
                    ->numeric()
                    ->minValue(0)
                    ->placeholder('اختياري'),
                Forms\Components\TextInput::make('usage_limit')
                    ->label('حد الاستخدام')
                    ->numeric()
                    ->minValue(0)
                    ->placeholder('اختياري'),
                Forms\Components\DateTimePicker::make('starts_at')
                    ->label('تاريخ البدء')
                    ->placeholder('اختياري'),
                Forms\Components\DateTimePicker::make('expires_at')
                    ->label('تاريخ الانتهاء')
                    ->placeholder('اختياري'),
                Forms\Components\Toggle::make('is_active')
                    ->label('مفعل')
                    ->default(true),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')->label('الكود')->searchable()->copyable(),
                Tables\Columns\TextColumn::make('type')->label('النوع')
                    ->formatStateUsing(fn ($state) => $state === 'fixed' ? 'ثابت' : 'نسبة'),
                Tables\Columns\TextColumn::make('value')->label('القيمة')
                    ->formatStateUsing(fn (Coupon $record) => $record->type === 'fixed'
                        ? number_format($record->value) . ' د.ع'
                        : $record->value . '%'),
                Tables\Columns\TextColumn::make('used_count')->label('استخدام')->sortable(),
                Tables\Columns\TextColumn::make('usage_limit')->label('الحد الأقصى'),
                Tables\Columns\IconColumn::make('is_active')->label('مفعل')->boolean(),
                Tables\Columns\TextColumn::make('expires_at')->label('ينتهي')
                    ->dateTime('Y-m-d')
                    ->since(),
            ])
            ->defaultSort('id', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('النوع')
                    ->options([
                        'fixed' => 'ثابت',
                        'percentage' => 'نسبة مئوية',
                    ]),
                Tables\Filters\TernaryFilter::make('is_active')->label('مفعل'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->label('تعديل'),
                Tables\Actions\DeleteAction::make()->label('حذف'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()->label('حذف المحدد'),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageCoupons::route('/'),
        ];
    }
}
