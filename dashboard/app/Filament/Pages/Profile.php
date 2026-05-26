<?php

namespace App\Filament\Pages;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class Profile extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-user-circle';

    protected static ?string $navigationLabel = 'الملف الشخصي';

    protected static ?string $title = 'الملف الشخصي';

    protected static ?string $navigationGroup = 'الإعدادات';

    protected static ?int $navigationSort = 99;

    // مخفي من القائمة الجانبية — متاح من الهيدر العلوي
    protected static bool $shouldRegisterNavigation = false;

    protected static string $view = 'filament.pages.profile';

    public ?array $data = [];

    public function mount(): void
    {
        $user = Auth::user();
        $this->form->fill([
            'name' => $user->name,
            'email' => $user->email,
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                TextInput::make('name')
                    ->label('الاسم')
                    ->required()
                    ->maxLength(255),
                TextInput::make('email')
                    ->label('البريد الإلكتروني')
                    ->email()
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),
                TextInput::make('current_password')
                    ->label('كلمة المرور الحالية')
                    ->password()
                    ->currentPassword(),
                TextInput::make('new_password')
                    ->label('كلمة المرور الجديدة')
                    ->password()
                    ->minLength(8)
                    ->same('new_password_confirmation'),
                TextInput::make('new_password_confirmation')
                    ->label('تأكيد كلمة المرور الجديدة')
                    ->password(),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();
        $user = Auth::user();

        $user->name = $data['name'];
        $user->email = $data['email'];

        if (! empty($data['new_password'])) {
            $user->password = Hash::make($data['new_password']);
        }

        $user->save();

        Notification::make()
            ->title('تم حفظ التغييرات')
            ->success()
            ->send();
    }
}
