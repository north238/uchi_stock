<?php

use App\Http\Controllers\GroupController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VoiceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    // ログインしている場合はダッシュボードにリダイレクト
    if (Auth::check()) {
        return redirect('dashboard');
    }

    return redirect('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'check.group'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // プロフィール関連
    Route::prefix('profile')->as('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    // グループ関連
    Route::prefix('groups')->as('groups.')->group(function () {
        Route::get('/', [GroupController::class, 'create'])->name('create');
        Route::post('/', [GroupController::class, 'store'])->name('store');
        Route::get('/default', [GroupController::class, 'createDefaultGroup'])->name('default.create');
        Route::get('/{id}/edit', [GroupController::class, 'edit'])->name('edit');
        Route::put('/{id}', [GroupController::class, 'update'])->name('update');
        Route::patch('/{id}', [GroupController::class, 'leaveGroup'])->name('leave');
        Route::delete('/{id}', [GroupController::class, 'destroy'])->name('destroy');
    });

    // アイテム関連
    Route::prefix('items')->as('items.')->group(function () {
        Route::get('/', [ItemController::class, 'index'])->name('index');
        Route::get('/create', [ItemController::class, 'create'])->name('create');
        Route::post('/', [ItemController::class, 'store'])->name('store');
        Route::get('/{id}', [ItemController::class, 'show'])->name('show');
        Route::put('/{id}', [ItemController::class, 'update'])->name('update');
        Route::delete('/{id}', [ItemController::class, 'destroy'])->name('destroy');
    });

    // todo::DEMO用削除可能
    Route::prefix('voice')->as('voice.')->group(function () {
        Route::get('/', [VoiceController::class, 'create'])->name('create');
    });
});

require __DIR__ . '/auth.php';
