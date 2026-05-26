<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WebhookResource\Pages;
use App\Models\Webhook;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class WebhookResource extends Resource
{
    protected static ?string $model = Webhook::class;

    protected static ?string $navigationIcon = 'heroicon-o-arrow-path';

    protected static ?string $navigationGroup = 'التسويق والبكسلات';

    protected static ?string $navigationLabel = 'الويبهوك';

    protected static ?string $pluralLabel = 'الويبهوك';

    protected static ?string $label = 'ويبهوك';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('url')
                    ->label('رابط الويبهوك')
                    ->url()
                    ->required()
                    ->maxLength(512),
                Forms\Components\TextInput::make('secret')
                    ->label('المفتاح السري')
                    ->maxLength(255)
                    ->helperText('سيُرسل في هيدر X-Webhook-Secret'),
                Forms\Components\Select::make('events')
                    ->label('الأحداث')
                    ->multiple()
                    ->options([
                        '*' => 'جميع الأحداث',
                        'order.created' => 'طلب جديد',
                        'order.status.pending' => 'حالة: قيد الانتظار',
                        'order.status.confirmed' => 'حالة: مؤكد',
                        'order.status.processing' => 'حالة: قيد التجهيز',
                        'order.status.shipped' => 'حالة: تم الشحن',
                        'order.status.delivered' => 'حالة: تم التسليم',
                        'order.status.cancelled' => 'حالة: ملغى',
                    ])
                    ->default(['*']),
                Forms\Components\Toggle::make('is_active')
                    ->label('مفعل')
                    ->default(true),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('url')
                    ->label('الرابط')
                    ->limit(40)
                    ->searchable(),
                Tables\Columns\TextColumn::make('events')
                    ->label('الأحداث')
                    ->badge()
                    ->formatStateUsing(fn ($state) => is_array($state) ? implode(', ', $state) : $state),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('مفعل')
                    ->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('تاريخ الإنشاء')
                    ->dateTime(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('الحالة'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageWebhooks::route('/'),
        ];
    }
}
