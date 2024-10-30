<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\SocialAccountController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// 認証用
Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);

// ログイン関係の処理
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'getUser'])->middleware('auth:sanctum');

// LINE認証
Route::middleware(['web'])->group(function () {
  Route::get('/auth/line/redirect', [SocialAccountController::class, 'socialLogin']);
  Route::get('/auth/line/callback', [SocialAccountController::class, 'handleProviderCallback']);
});

// アイテム取得
Route::get('/items', [ItemController::class, 'index']);