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

class ManageMarketingPixels extends Page implements HasForms
{
    use InteractsWithForms;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-signal';

    protected string $view = 'filament.pages.manage-marketing-pixels';

    protected static ?string $navigationLabel = 'البكسلات والقياس';

    protected static ?string $title = 'البكسلات ووسوم التتبع';

    protected static string | \UnitEnum | null $navigationGroup = 'التسويق والبكسلات';

    protected static ?int $navigationSort = 15;

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill(StoreSetting::current()->only([
            'meta_pixel_id',
            'tiktok_pixel_id',
            'google_analytics_id',
            'snapchat_pixel_id',
            'twitter_pixel_id',
            'custom_head_snippet',
        ]));
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('منصات الإعلانات والقياس')
                    ->description('أدخل المعرفات كما تظهر في منصات الإعلانات (بدون مسافات). تُستخدم في واجهة المتجر عند الربط بالـ API.')
                    ->schema([
                        Forms\Components\TextInput::make('meta_pixel_id')
                            ->label('معرّف بكسل ميتا (فيسبوك / إنستغرام)')
                            ->placeholder('مثال: 123456789012345')
                            ->maxLength(64),
                        Forms\Components\TextInput::make('tiktok_pixel_id')
                            ->label('معرّف بكسل تيك توك')
                            ->maxLength(64),
                        Forms\Components\TextInput::make('google_analytics_id')
                            ->label('معرّف Google Analytics (GA4)')
                            ->placeholder('مثال: G-XXXXXXXXXX')
                            ->maxLength(32),
                        Forms\Components\TextInput::make('snapchat_pixel_id')
                            ->label('معرّف بكسل سناب شات')
                            ->maxLength(64),
                        Forms\Components\TextInput::make('twitter_pixel_id')
                            ->label('معرّف بكسل X (تويتر)')
                            ->maxLength(64),
                    ])->columns(2),
                Forms\Components\Section::make('متقدم')
                    ->schema([
                        Forms\Components\Textarea::make('custom_head_snippet')
                            ->label('كود إضافي داخل <head> (اختياري)')
                            ->helperText('لأدوات تحقق نطاق، سكربتات طرف ثالث، أو بكسلات مخصصة — استخدم بحذر.')
                            ->rows(6)
                            ->columnSpanFull(),
                    ]),
                Forms\Components\Actions::make([
                    FormAction::make('save')
                        ->label('حفظ')
                        ->action('save')
                        ->color('primary'),
                ]),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        StoreSetting::current()->update($this->form->getState());
        Notification::make()->title('تم حفظ إعدادات البكسلات')->success()->send();
    }
}
