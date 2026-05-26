<?php

use App\Http\Controllers\Api\CustomerAuthController;
use App\Http\Controllers\Api\CustomerOrderController;
use App\Http\Controllers\Api\CustomerPasswordResetController;
use App\Http\Controllers\Api\OrderApiController;
use App\Http\Controllers\Api\StorefrontController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/store', [StorefrontController::class, 'store']);
    Route::get('/categories', [StorefrontController::class, 'categories']);
    Route::get('/products/{id}', [StorefrontController::class, 'product'])->where('id', '[A-Za-z0-9._-]+');
    Route::get('/products', [StorefrontController::class, 'products']);
    Route::get('/banners', [StorefrontController::class, 'banners']);
Route::get('/events', [\App\Http\Controllers\Api\StoreEventsController::class, 'stream']);
Route::get('/store-status', [\App\Http\Controllers\Api\StoreEventsController::class, 'status']);
    Route::post('/orders', [OrderApiController::class, 'store'])->middleware('throttle:20,1');

    Route::post('/auth/register', [CustomerAuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/auth/login', [CustomerAuthController::class, 'login'])->middleware('throttle:15,1');

    Route::post('/auth/forgot-password', [CustomerPasswordResetController::class, 'sendOtp'])->middleware('throttle:5,1');
    Route::post('/auth/reset-password', [CustomerPasswordResetController::class, 'verifyOtp'])->middleware('throttle:10,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [CustomerAuthController::class, 'logout'])->middleware('throttle:30,1');
        Route::get('/auth/me', [CustomerAuthController::class, 'me']);
        Route::get('/my/orders', [CustomerOrderController::class, 'index']);
        Route::get('/my/orders/{invoiceId}', [CustomerOrderController::class, 'show'])
            ->where('invoiceId', '[A-Za-z0-9._-]+');
    });
});
