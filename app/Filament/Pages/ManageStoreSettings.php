<?php

namespace App\Filament\Pages;

use App\Models\StoreSetting;
use Filament\Forms;
use Filament\Forms\Components\Actions\Action as FormAction;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Schemas\Schema as Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class ManageStoreSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected string $view = 'filament.pages.manage-store-settings';

    protected static ?string $navigationLabel = 'إعدادات المتجر';

    protected static ?string $title = 'إعدادات المتجر والهوية';

    protected static string | \UnitEnum | null $navigationGroup = 'الإعدادات';

    protected static ?int $navigationSort = 999;

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill(StoreSetting::current()->attributesToArray());
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('الاسم والشعار')
                    ->schema([
                        Forms\Components\TextInput::make('store_name')
                            ->label('اسم المتجر')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('meta_title')
                            ->label('عنوان التبويب (SEO)')
                            ->maxLength(255),
                        Forms\Components\Textarea::make('slogan_line1')
                            ->label('السطر الأول للشعار')
                            ->rows(2),
                        Forms\Components\Textarea::make('slogan_line2')
                            ->label('السطر الثاني للشعار')
                            ->rows(3),
                        Forms\Components\TextInput::make('slogan_highlight_phrase')
                            ->label('عبارة مميزة في الشعار (للعرض في الموقع)')
                            ->maxLength(255),
                        \Filament\Forms\Components\SpatieMediaLibraryFileUpload::make('logo')
                            ->label('شعار المتجر')
                            ->collection('logo')
                            ->image()
                            ->imageResizeMode('contain')
                            ->maxSize(2048)
                            ->conversion('thumb'),
                    ])->columns(2),
                Forms\Components\Section::make('ألوان الواجهة')
                    ->schema([
                        Forms\Components\ColorPicker::make('header_background')->label('خلفية الهيدر'),
                        Forms\Components\ColorPicker::make('footer_background')->label('خلفية الفوتر'),
                        Forms\Components\ColorPicker::make('primary_color')->label('اللون الأساسي'),
                    ])->columns(3),
                Forms\Components\Section::make('العنوان والخريطة')
                    ->schema([
                        Forms\Components\Textarea::make('address_line')
                            ->label('عنوان المحل')
                            ->rows(2)
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('map_lat')
                            ->label('خط العرض')
                            ->numeric(),
                        Forms\Components\TextInput::make('map_lng')
                            ->label('خط الطول')
                            ->numeric(),
                        Forms\Components\Textarea::make('map_embed_url')
                            ->label('رابط تضمين خرائط جوجل (اختياري)')
                            ->rows(2)
                            ->columnSpanFull(),
                    ])->columns(2),
                Forms\Components\Section::make('روابط التواصل')
                    ->schema([
                        Forms\Components\TextInput::make('phone_primary')->label('هاتف أول')->tel(),
                        Forms\Components\TextInput::make('phone_secondary')->label('هاتف ثاني')->tel(),
                        Forms\Components\TextInput::make('instagram_url')->label('إنستغرام')->url()->maxLength(512),
                        Forms\Components\TextInput::make('facebook_url')->label('فيسبوك')->url()->maxLength(512),
                        Forms\Components\TextInput::make('tiktok_url')->label('تيك توك')->url()->maxLength(512),
                    ])->columns(2),
                Forms\Components\Actions::make([
                    FormAction::make('save')
                        ->label('حفظ الإعدادات')
                        ->action('save')
                        ->color('primary'),
                ]),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        StoreSetting::current()->update($this->form->getState());
        Notification::make()->title('تم حفظ الإعدادات')->success()->send();
    }
}
