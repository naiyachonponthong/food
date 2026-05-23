<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\KitchenController;
use App\Http\Controllers\MenuCategoryController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Public\CustomerController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\TableController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Health check
    Route::get('/health', fn () => ['status' => 'ok', 'time' => now()->toIso8601String()]);

    // Auth (no token needed for login)
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Public customer API — token-gated per session, no auth
    Route::prefix('public/{token}')->group(function () {
        Route::get('/restaurant', [CustomerController::class, 'restaurant']);
        Route::get('/menus', [CustomerController::class, 'menus']);
        Route::get('/package', [CustomerController::class, 'package']);
        Route::post('/orders', [CustomerController::class, 'placeOrder']);
        Route::get('/orders', [CustomerController::class, 'myOrders']);
        Route::post('/call-staff', [CustomerController::class, 'callStaff']);
        Route::post('/bill', [CustomerController::class, 'requestBill']);
        Route::get('/bill', [CustomerController::class, 'bill']);
    });

    // Auth-required staff/owner routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('/auth/password', [AuthController::class, 'changePassword']);

        // Restaurant
        Route::get('/restaurant', [RestaurantController::class, 'show']);
        Route::put('/restaurant', [RestaurantController::class, 'update']);
        Route::put('/restaurant/settings', [RestaurantController::class, 'updateSettings']);

        // Menu categories
        Route::get('/categories', [MenuCategoryController::class, 'index']);
        Route::post('/categories', [MenuCategoryController::class, 'store']);
        Route::put('/categories/reorder', [MenuCategoryController::class, 'reorder']);
        Route::put('/categories/{id}', [MenuCategoryController::class, 'update']);
        Route::delete('/categories/{id}', [MenuCategoryController::class, 'destroy']);

        // Menus
        Route::get('/menus', [MenuController::class, 'index']);
        Route::post('/menus', [MenuController::class, 'store']);
        Route::get('/menus/{id}', [MenuController::class, 'show']);
        Route::put('/menus/{id}', [MenuController::class, 'update']);
        Route::delete('/menus/{id}', [MenuController::class, 'destroy']);
        Route::put('/menus/{id}/availability', [MenuController::class, 'toggleAvailability']);

        // Tables
        Route::get('/tables', [TableController::class, 'index']);
        Route::post('/tables', [TableController::class, 'store']);
        Route::put('/tables/{id}', [TableController::class, 'update']);
        Route::delete('/tables/{id}', [TableController::class, 'destroy']);
        Route::get('/tables/{id}/qr', [TableController::class, 'qr']);

        // Sessions
        Route::post('/sessions', [SessionController::class, 'open']);
        Route::get('/sessions/{token}', [SessionController::class, 'byToken']);
        Route::put('/sessions/{id}/start', [SessionController::class, 'startTimer']);
        Route::put('/sessions/{id}/extend', [SessionController::class, 'extend']);
        Route::put('/sessions/{id}/close', [SessionController::class, 'close']);
        Route::get('/sessions/{id}/summary', [SessionController::class, 'summary']);
        Route::get('/sessions/{id}/timer', [SessionController::class, 'timer']);
        Route::get('/sessions/{id}/orders', [OrderController::class, 'forSession']);

        // Orders
        Route::get('/orders', [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'place']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);

        // Kitchen
        Route::get('/kitchen/queue', [KitchenController::class, 'queue']);
        Route::put('/kitchen/items/{id}', [KitchenController::class, 'updateItem']);

        // Payments
        Route::get('/payments/session/{id}', [PaymentController::class, 'forSession']);
        Route::post('/payments', [PaymentController::class, 'create']);
        Route::put('/payments/{id}/pay', [PaymentController::class, 'markPaid']);
        Route::post('/payments/{id}/qr', [PaymentController::class, 'generateQr']);
        Route::post('/payments/{id}/slip', [PaymentController::class, 'uploadSlip']);
        Route::put('/payments/{id}/verify', [PaymentController::class, 'verifySlip']);

        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'markRead']);
        Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']);

        // Expenses
        Route::get('/expense-categories', [ExpenseController::class, 'categories']);
        Route::post('/expense-categories', [ExpenseController::class, 'storeCategory']);
        Route::get('/expenses', [ExpenseController::class, 'index']);
        Route::post('/expenses', [ExpenseController::class, 'store']);
        Route::put('/expenses/{id}', [ExpenseController::class, 'update']);
        Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);
        Route::get('/expenses/summary', [ExpenseController::class, 'summary']);

        // Dashboard
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
        Route::get('/dashboard/sales', [DashboardController::class, 'sales']);
        Route::get('/dashboard/top-menus', [DashboardController::class, 'topMenus']);
        Route::get('/dashboard/pl', [DashboardController::class, 'pl']);
        Route::get('/dashboard/hourly', [DashboardController::class, 'hourly']);
    });
});
