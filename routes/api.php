<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminBannerController;
use App\Http\Controllers\Api\AdminCategoryController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminCouponController;
use App\Http\Controllers\Api\AdminCustomerController;
use App\Http\Controllers\Api\AdminNotificationController;
use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\AdminProductOptionController;
use App\Http\Controllers\Api\AdminWebhookController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerAuthController;
use App\Http\Controllers\Api\CustomerOrderController;
use App\Http\Controllers\Api\CustomerPasswordResetController;
use App\Http\Controllers\Api\OrderApiController;
use App\Http\Controllers\Api\OrderOtpController;
use App\Http\Controllers\Api\OtpController;
use App\Http\Controllers\Api\StorefrontController;
use App\Http\Middleware\Api\ForceJsonResponse;
use App\Http\Middleware\Api\LogRequests;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/store', [StorefrontController::class, 'store']);
    Route::get('/categories', [StorefrontController::class, 'categories']);
    Route::get('/products/{id}', [StorefrontController::class, 'product']);
    Route::get('/products', [StorefrontController::class, 'products']);
    Route::get('/banners', [StorefrontController::class, 'banners']);
    Route::get('/events', [\App\Http\Controllers\Api\StoreEventsController::class, 'stream']);
    Route::get('/store-status', [\App\Http\Controllers\Api\StoreEventsController::class, 'status']);
    Route::get('/notifications/stream', [AdminNotificationController::class, 'stream']);
    Route::post('/orders', [OrderApiController::class, 'store'])->middleware('throttle:20,1');
    Route::get('/coupons/validate/{code}', [OrderApiController::class, 'validateCoupon']);

    Route::post('/auth/request-otp', [AuthController::class, 'requestOtp'])->middleware('throttle:5,1');
    Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp'])->middleware('throttle:5,1');

    Route::post('/auth/register', [CustomerAuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/auth/login', [CustomerAuthController::class, 'login'])->middleware('throttle:15,1');

    Route::post('/admin/auth/login', [AdminAuthController::class, 'login']);

    Route::post('/auth/forgot-password', [CustomerPasswordResetController::class, 'sendOtp'])->middleware('throttle:5,1');
    Route::post('/auth/reset-password', [CustomerPasswordResetController::class, 'verifyOtp'])->middleware('throttle:10,1');

    Route::post('/otp/send', [OtpController::class, 'send'])->middleware('throttle:5,1');
    Route::post('/otp/verify', [OtpController::class, 'verify'])->middleware('throttle:10,1');

    Route::middleware(['auth:sanctum', ForceJsonResponse::class, LogRequests::class])->group(function () {
        Route::post('/auth/logout', [CustomerAuthController::class, 'logout'])->middleware('throttle:30,1');
        Route::get('/auth/me', [CustomerAuthController::class, 'me']);
        Route::put('/auth/profile', [CustomerAuthController::class, 'updateProfile']);
        Route::get('/my/orders', [CustomerOrderController::class, 'index']);
        Route::get('/my/orders/{invoiceId}', [CustomerOrderController::class, 'show'])
            ->where('invoiceId', '[A-Za-z0-9._-]+');

        Route::post('/orders/request-confirmation', [OrderOtpController::class, 'requestConfirmation'])->middleware('throttle:3,1');
        Route::post('/orders/confirm', [OrderOtpController::class, 'confirm'])->middleware('throttle:5,1');

        Route::post('/admin/auth/logout', [AdminAuthController::class, 'logout']);
        Route::get('/admin/auth/me', [AdminAuthController::class, 'me']);

        Route::middleware('admin')->group(function () {
            Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
            Route::get('/admin/analytics', [AdminController::class, 'analytics']);
            Route::get('/admin/store', [AdminController::class, 'getStore']);
            Route::put('/admin/store', [AdminController::class, 'updateStore']);

            Route::get('/admin/orders', [AdminOrderController::class, 'index']);
            Route::get('/admin/orders/{id}', [AdminOrderController::class, 'show']);
            Route::put('/admin/orders/{id}', [AdminOrderController::class, 'update']);
            Route::delete('/admin/orders/{id}', [AdminOrderController::class, 'destroy']);

            Route::get('/admin/customers', [AdminCustomerController::class, 'index']);
            Route::get('/admin/customers/{id}', [AdminCustomerController::class, 'show']);
            Route::post('/admin/customers', [AdminCustomerController::class, 'store']);
            Route::put('/admin/customers/{id}', [AdminCustomerController::class, 'update']);
            Route::delete('/admin/customers/{id}', [AdminCustomerController::class, 'destroy']);

            Route::get('/admin/products', [AdminProductController::class, 'index']);
            Route::get('/admin/products/{id}', [AdminProductController::class, 'show']);
            Route::post('/admin/products', [AdminProductController::class, 'store']);
            Route::put('/admin/products/{id}', [AdminProductController::class, 'update']);
            Route::delete('/admin/products/{id}', [AdminProductController::class, 'destroy']);

            Route::get('/admin/categories', [AdminCategoryController::class, 'index']);
            Route::get('/admin/categories/{id}', [AdminCategoryController::class, 'show']);
            Route::post('/admin/categories', [AdminCategoryController::class, 'store']);
            Route::put('/admin/categories/{id}', [AdminCategoryController::class, 'update']);
            Route::delete('/admin/categories/{id}', [AdminCategoryController::class, 'destroy']);

            Route::get('/admin/banners', [AdminBannerController::class, 'index']);
            Route::get('/admin/banners/{id}', [AdminBannerController::class, 'show']);
            Route::post('/admin/banners', [AdminBannerController::class, 'store']);
            Route::put('/admin/banners/{id}', [AdminBannerController::class, 'update']);
            Route::delete('/admin/banners/{id}', [AdminBannerController::class, 'destroy']);

            Route::get('/notifications', [AdminNotificationController::class, 'index']);
            Route::get('/notifications/unread-count', [AdminNotificationController::class, 'unreadCount']);
            Route::post('/notifications/{id}/read', [AdminNotificationController::class, 'markAsRead']);
            Route::post('/notifications/read-all', [AdminNotificationController::class, 'markAllAsRead']);

            Route::put('/admin/auth/profile', [AdminAuthController::class, 'updateProfile']);

            Route::get('/admin/webhooks', [AdminWebhookController::class, 'index']);
            Route::get('/admin/webhooks/{id}', [AdminWebhookController::class, 'show']);
            Route::post('/admin/webhooks', [AdminWebhookController::class, 'store']);
            Route::put('/admin/webhooks/{id}', [AdminWebhookController::class, 'update']);
            Route::delete('/admin/webhooks/{id}', [AdminWebhookController::class, 'destroy']);

            Route::get('/admin/coupons', [AdminCouponController::class, 'index']);
            Route::get('/admin/coupons/{id}', [AdminCouponController::class, 'show']);
            Route::post('/admin/coupons', [AdminCouponController::class, 'store']);
            Route::put('/admin/coupons/{id}', [AdminCouponController::class, 'update']);
            Route::delete('/admin/coupons/{id}', [AdminCouponController::class, 'destroy']);

            Route::get('/admin/product-options', [AdminProductOptionController::class, 'index']);
            Route::get('/admin/product-options/{id}', [AdminProductOptionController::class, 'show']);
            Route::post('/admin/product-options', [AdminProductOptionController::class, 'store']);
            Route::put('/admin/product-options/{id}', [AdminProductOptionController::class, 'update']);
            Route::delete('/admin/product-options/{id}', [AdminProductOptionController::class, 'destroy']);
            Route::post('/admin/product-options/{optionId}/values', [AdminProductOptionController::class, 'storeValue']);
            Route::put('/admin/product-options/{optionId}/values/{valueId}', [AdminProductOptionController::class, 'updateValue']);
            Route::delete('/admin/product-options/{optionId}/values/{valueId}', [AdminProductOptionController::class, 'destroyValue']);
        });
    });
});
