<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
| Diakses oleh Next.js Landing Page & Journal Page
*/

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Products (Public)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Journal/Posts (Public)
// PENTING: Menggunakan {slug} agar sinkron dengan Next.js app/journal/[slug]
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{slug}', [PostController::class, 'show']); 

// Payment Webhook
Route::post('/midtrans-notification', [PaymentController::class, 'handleNotification']);


/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // 1. User Management (CRUD LENGKAP)
    // Pastikan rute-rute ini ada agar Frontend bisa melakukan Create, Update, & Delete
    Route::get('/users', [UserController::class, 'index']);           // Read
    Route::post('/users', [UserController::class, 'store']);          // Create
    Route::put('/users/{id}', [UserController::class, 'update']);     // Update data
    Route::patch('/users/{id}/status', [UserController::class, 'updateStatus']); // Update Status
    Route::delete('/users/{id}', [UserController::class, 'destroy']); // Delete
    Route::get('/admin/dashboard-stats', [DashboardController::class, 'getStats']);
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // 2. Transaction & Orders (User Side)
    Route::post('/checkout', [PaymentController::class, 'checkout']); 
    Route::get('/user/orders', [OrderController::class, 'userOrders']);
    Route::post('/orders', [OrderController::class, 'store']);

    // 3. Admin Order Management
    Route::get('/admin/orders', [PaymentController::class, 'index']);
    Route::patch('/admin/orders/{id}', [PaymentController::class, 'update']);
    Route::delete('/admin/orders/{id}', [PaymentController::class, 'destroy']);

    // 4. Product Management
    Route::post('/products', [ProductController::class, 'store']);
    Route::post('/products/{id}', [ProductController::class, 'update']); 
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // 5. Journal Management
    Route::post('/posts', [PostController::class, 'store']);
    Route::post('/posts/{id}', [PostController::class, 'update']); 
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
});