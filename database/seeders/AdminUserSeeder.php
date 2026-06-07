<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@alatraqji.local'],
            [
                'first_name' => 'مدير',
                'last_name' => 'المتجر',
                'password' => Hash::make('password'),
                'is_admin' => true,
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'test@alatraqche.local'],
            [
                'first_name' => 'حساب',
                'last_name' => 'اختبار',
                'password' => Hash::make('test-test-123'),
                'is_admin' => true,
            ]
        );

        $this->command?->info('حساب المدير: admin@alatraqji.local / password');
        $this->command?->info('حساب الاختبار: test@alatraqche.local / test-test-123');
    }
}
