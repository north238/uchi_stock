<?php

use App\Http\Controllers\GroupController;
use App\Http\Controllers\LineMessengerController;
use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
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
        return redirect('/dashboard');
    }

    return redirect('/login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'check.group'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // プロフィール関連のルーティング
    Route::prefix('profile')->as('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    // グループ関連のルーティング
    Route::prefix('groups')->as('groups.')->group(function () {
        Route::get('/', [GroupController::class, 'create'])->name('create');
        Route::post('/', [GroupController::class, 'store'])->name('store');
        Route::get('/default', [GroupController::class, 'createDefaultGroup'])->name('default.create');
        Route::get('/{id}/edit', [GroupController::class, 'edit'])->name('edit');
        Route::put('/{id}', [GroupController::class, 'update'])->name('update');
        Route::patch('/{id}', [GroupController::class, 'leaveGroup'])->name('leave');
        Route::delete('/{id}', [GroupController::class, 'destroy'])->name('destroy');
    });
});

//LINEメッセージングAPIのルーティング
Route::prefix('line')->as('line.')->group(function () {
    Route::post('/webhook', [LineMessengerController::class, 'webhook'])->name('webhook');
    Route::get('/message', [LineMessengerController::class, 'message'])->name('message');
});

Route::get('/upload-audio', function () {
    return view('upload-audio');
});

Route::post('/upload-audio', function (Request $request) {
    $request->validate([
        'audio' => 'required|file|mimes:mp3,wav,m4a',
    ]);

    $file = $request->file('audio');

    $response = Http::timeout(180)->attach(
        'file',
        file_get_contents($file->getRealPath()),
        $file->getClientOriginalName()
    )->post('http://whisper:5000/transcribe'); // Docker内ネットワーク名に合わせる

    return view('upload-audio', ['result' => $response->json()['text'] ?? '変換失敗']);
});

require __DIR__ . '/auth.php';
