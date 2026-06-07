<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BannerResource\Pages;
use App\Models\Banner;
use Filament\Forms;
use Filament\Schemas\Schema as Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class BannerResource extends Resource
{
    protected static ?string $model = Banner::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-photo';

    protected static ?string $navigationLabel = 'البنرات';

    protected static ?string $modelLabel = 'بنر';

    protected static ?string $pluralModelLabel = 'البنرات';

    protected static string | \UnitEnum | null $navigationGroup = 'المتجر';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('title')
                    ->label('عنوان (اختياري)')
                    ->maxLength(255),
                \Filament\Forms\Components\SpatieMediaLibraryFileUpload::make('image')
                    ->label('صورة البنر')
                    ->collection('default')
                    ->image()
                    ->imageResizeMode('cover')
                    ->imageCropAspectRatio('2.4:1')
                    ->maxSize(10240),
                Forms\Components\TextInput::make('link_url')
                    ->label('رابط عند النقر')
                    ->url()
                    ->maxLength(1024),
                Forms\Components\TextInput::make('sort_order')
                    ->label('الترتيب')
                    ->numeric()
                    ->default(0),
                Forms\Components\Toggle::make('is_active')
                    ->label('نشط')
                    ->default(true),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                \Filament\Tables\Columns\SpatieMediaLibraryImageColumn::make('image')
                    ->label('صورة')
                    ->collection('default')
                    ->conversion('thumb'),
                Tables\Columns\TextColumn::make('title')->label('العنوان')->searchable(),
                Tables\Columns\TextColumn::make('link_url')->label('الرابط')->limit(30),
                Tables\Columns\TextColumn::make('sort_order')->label('الترتيب')->sortable(),
                Tables\Columns\IconColumn::make('is_active')->label('نشط')->boolean(),
            ])
            ->defaultSort('sort_order')
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
            'index' => Pages\ManageBanners::route('/'),
        ];
    }
}
