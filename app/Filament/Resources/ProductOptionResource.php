<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductOptionResource\Pages;
use App\Models\ProductOption;
use Filament\Forms;
use Filament\Schemas\Schema as Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ProductOptionResource extends Resource
{
    protected static ?string $model = ProductOption::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-variable';

    protected static ?string $navigationLabel = 'خيارات المنتجات';

    protected static ?string $modelLabel = 'خيار';

    protected static ?string $pluralModelLabel = 'خيارات المنتجات';

    protected static string | \UnitEnum | null $navigationGroup = 'المتجر';

    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('معلومات الخيار')
                    ->columns(3)
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('اسم الخيار')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('slug')
                            ->label('المعرّف المختصر')
                            ->required()
                            ->maxLength(255)
                            ->helperText('مثال: color, size, material'),
                        Forms\Components\Select::make('type')
                            ->label('النوع')
                            ->options([
                                'select' => 'قائمة منسدلة',
                                'radio' => 'أزرار دائرية (Radio)',
                                'button' => 'أزرار (Button)',
                                'color' => 'ألوان (Color)',
                                'checkbox' => 'خيارات متعددة (Checkbox)',
                            ])
                            ->required()
                            ->native(false),
                    ]),
                Forms\Components\Section::make('قيم الخيار')
                    ->schema([
                        Forms\Components\Repeater::make('values')
                            ->relationship()
                            ->schema([
                                Forms\Components\Grid::make(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('value')
                                            ->label('القيمة')
                                            ->required()
                                            ->maxLength(255),
                                        Forms\Components\TextInput::make('price_adjustment')
                                            ->label('تعديل السعر (دينار)')
                                            ->numeric()
                                            ->default(0)
                                            ->step(1000),
                                        Forms\Components\TextInput::make('sort_order')
                                            ->label('الترتيب')
                                            ->numeric()
                                            ->default(0),
                                    ]),
                            ])
                            ->defaultItems(0)
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => $state['value'] ?? null),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->label('الاسم')->searchable(),
                Tables\Columns\TextColumn::make('slug')->label('المعرّف')->searchable()->badge(),
                Tables\Columns\TextColumn::make('type')->label('النوع')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'select' => 'gray',
                        'radio' => 'info',
                        'button' => 'warning',
                        'color' => 'danger',
                        'checkbox' => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('values_count')->label('عدد القيم')
                    ->counts('values'),
                Tables\Columns\TextColumn::make('created_at')->label('تاريخ الإنشاء')
                    ->dateTime('Y-m-d')->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('id', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('النوع')
                    ->options([
                        'select' => 'قائمة منسدلة',
                        'radio' => 'أزرار دائرية',
                        'button' => 'أزرار',
                        'color' => 'ألوان',
                        'checkbox' => 'خيارات متعددة',
                    ]),
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
            'index' => Pages\ManageProductOptions::route('/'),
        ];
    }
}
