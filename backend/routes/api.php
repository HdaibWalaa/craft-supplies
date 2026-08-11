<?php

use App\Http\Controllers\Api\V1\AddressController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BlogPostController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\DiscountController;
use App\Http\Controllers\Api\V1\NewsletterController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\StripeWebhookController;
use App\Http\Controllers\Api\V1\WishlistController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('api.locale')->group(function (): void {
    Route::middleware('throttle:auth')->group(function (): void {
        Route::post('auth/register', [AuthController::class, 'register']);
        Route::post('auth/login', [AuthController::class, 'login']);
        Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);
    });
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::patch('auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('auth/password', [AuthController::class, 'changePassword']);
        Route::post('cart/merge', [CartController::class, 'merge']);
        Route::apiResource('addresses', AddressController::class)->except(['show']);
        Route::patch('addresses/{address}/default', [AddressController::class, 'makeDefault']);
        Route::get('wishlist', [WishlistController::class, 'index']);
        Route::post('wishlist', [WishlistController::class, 'store']);
        Route::delete('wishlist/{product}', [WishlistController::class, 'destroy']);
        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{orderNumber}', [OrderController::class, 'show']);
    });
    Route::get('products', [ProductController::class, 'index']);
    Route::get('testimonials', [ProductController::class, 'testimonials']);
    Route::get('cart', [CartController::class, 'show']);
    Route::post('cart/items', [CartController::class, 'store']);
    Route::post('discounts/validate', [DiscountController::class, 'validateCode'])->middleware('throttle:20,1');
    Route::post('checkout', [CheckoutController::class, 'store'])->middleware('throttle:10,1');
    Route::get('checkout/orders/{orderNumber}', [CheckoutController::class, 'status'])->middleware('throttle:20,1');
    Route::post('webhooks/stripe', StripeWebhookController::class);
    Route::post('products/{product}/reviews', [ReviewController::class, 'store'])->middleware('throttle:5,1');
    Route::post('newsletter/subscribe', [NewsletterController::class, 'store'])->middleware('throttle:5,1');
    Route::post('contact', [ContactController::class, 'store'])->middleware('throttle:5,1');
    Route::patch('cart/items/{item}', [CartController::class, 'update']);
    Route::delete('cart/items/{item}', [CartController::class, 'destroy']);
    Route::delete('cart', [CartController::class, 'clear']);
    Route::get('products/{slug}', [ProductController::class, 'show']);
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{slug}', [CategoryController::class, 'show']);
    Route::get('categories/{slug}/products', [CategoryController::class, 'products']);
    Route::get('blog', [BlogPostController::class, 'index']);
    Route::get('blog/{slug}', [BlogPostController::class, 'show']);
});
