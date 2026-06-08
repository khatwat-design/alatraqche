<?php

use App\Http\Controllers\ReportDownloadController;
use Illuminate\Support\Facades\Route;

Route::get('/docs', function () {
    return redirect('/docs/index.html');
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'app' => config('app.name'),
        'env' => config('app.env'),
        'debug' => config('app.debug'),
        'timezone' => config('app.timezone'),
        'locale' => config('app.locale'),
    ]);
});

Route::get('/login', function () {
    return redirect('/admin/login');
})->name('login');

Route::prefix('admin/reports/download')->middleware([
    \Illuminate\Cookie\Middleware\EncryptCookies::class,
    \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    \Illuminate\Session\Middleware\StartSession::class,
    \Filament\Http\Middleware\AuthenticateSession::class,
    \Illuminate\View\Middleware\ShareErrorsFromSession::class,
    \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
    \Filament\Http\Middleware\DisableBladeIconComponents::class,
    \Filament\Http\Middleware\DispatchServingFilamentEvent::class,
    \App\Http\Middleware\SetFilamentLocale::class,
    \Filament\Http\Middleware\Authenticate::class,
])->group(function () {
    Route::get('/orders', [ReportDownloadController::class, 'orders']);
    Route::get('/customers', [ReportDownloadController::class, 'customers']);
    Route::get('/analytics', [ReportDownloadController::class, 'analytics']);
});
