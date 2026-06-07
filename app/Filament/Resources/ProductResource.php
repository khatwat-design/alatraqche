<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Models\Category;
use App\Models\Product;
use Filament\Forms;
use Filament\Schemas\Schema as Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-shopping-bag';

    protected static ?string $navigationLabel = 'المنتجات';

    protected static ?string $modelLabel = 'منتج';

    protected static ?string $pluralModelLabel = 'المنتجات';

    protected static string | \UnitEnum | null $navigationGroup = 'المتجر';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('معلومات أساسية')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('id')
                            ->label('المعرّف')
                            ->required()
                            ->maxLength(128)
                            ->disabledOn('edit'),
                        Forms\Components\Select::make('category_id')
                            ->label('التصنيف')
                            ->options(fn () => Category::query()->orderBy('name')->pluck('name', 'id'))
                            ->required()
                            ->searchable(),
                        Forms\Components\TextInput::make('name')
                            ->label('اسم المنتج')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('description')
                            ->label('الوصف')
                            ->required()
                            ->rows(4)
                            ->columnSpanFull(),
                    ]),
                Forms\Components\Section::make('السعر والصور')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('price')
                            ->label('السعر (دينار)')
                            ->numeric()
                            ->required()
                            ->minValue(0)
                            ->columnSpan(1),
                        Forms\Components\TextInput::make('badge')
                            ->label('شارة (اختياري)')
                            ->maxLength(64)
                            ->columnSpan(1),
                        \Filament\Forms\Components\SpatieMediaLibraryFileUpload::make('image')
                            ->label('صور المنتج')
                            ->collection('default')
                            ->multiple()
                            ->image()
                            ->imageResizeMode('contain')
                            ->maxSize(10240)
                            ->responsiveImages()
                            ->reorderable()
                            ->columnSpanFull(),
                    ]),
                Forms\Components\Section::make('خيارات المنتج')
                    ->schema([
                        Forms\Components\Select::make('options')
                            ->label('الخيارات المتاحة')
                            ->multiple()
                            ->relationship('options', 'name')
                            ->preload()
                            ->searchable()
                            ->helperText('اختر الخيارات المتاحة لهذا المنتج (مثل: اللون، المقاس)'),
                    ]),
                Forms\Components\Section::make('إعدادات المخزون والعرض')
                    ->columns(3)
                    ->schema([
                        Forms\Components\TextInput::make('stock_qty')
                            ->label('المخزون')
                            ->numeric()
                            ->default(0)
                            ->minValue(0)
                            ->required(),
                        Forms\Components\Toggle::make('is_visible')
                            ->label('ظاهر في الموقع')
                            ->default(true),
                        Forms\Components\TextInput::make('sort_order')
                            ->label('ترتيب العرض')
                            ->numeric()
                            ->default(0),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                \Filament\Tables\Columns\SpatieMediaLibraryImageColumn::make('image')
                    ->label('صورة')
                    ->collection('default')
                    ->conversion('thumb')
                    ->width(50)
                    ->height(50)
                    ->square(),
                Tables\Columns\TextColumn::make('id')->label('المعرّف')->limit(20)->searchable(),
                Tables\Columns\TextColumn::make('name')->label('الاسم')->searchable()->wrap(),
                Tables\Columns\TextColumn::make('category.name')->label('التصنيف'),
                Tables\Columns\TextColumn::make('price')->label('السعر')->numeric(),
                Tables\Columns\TextColumn::make('stock_qty')->label('المخزون')->sortable(),
                Tables\Columns\IconColumn::make('is_visible')->label('ظاهر')->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('category_id')
                    ->label('التصنيف')
                    ->relationship('category', 'name'),
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
            'index' => Pages\ManageProducts::route('/'),
        ];
    }
}
