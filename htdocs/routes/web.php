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
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // グループ関連のルーティング
    Route::get('/groups', [GroupController::class, 'create'])->name('groups.create');
    Route::post('/groups', [GroupController::class, 'store'])->name('groups.store');
    Route::get('/groups/default', [GroupController::class, 'createDefaultGroup'])->name('groups.default.create');
    Route::get('/groups/{id}/edit', [GroupController::class, 'edit'])->name('groups.edit');
    Route::put('/groups/{id}', [GroupController::class, 'update'])->name('groups.update');
    Route::patch('/groups/{id}', [GroupController::class, 'leaveGroup'])->name('groups.leave');
    Route::delete('/groups/{id}', [GroupController::class, 'destroy'])->name('groups.destroy');
});

//LINEメッセージングAPIのルーティング
Route::post('/line/webhook', [LineMessengerController::class, 'webhook'])->name('line.webhook');
Route::get('/line/message', [LineMessengerController::class, 'message'])->name('line.message');

Route::get('/upload-audio', function () {
    return view('upload-audio');
});

Route::post('/upload-audio', function (Request $request) {
    $request->validate([
        'audio' => 'required|file|mimes:mp3,wav,m4a',
    ]);

    $file = $request->file('audio');

    $response = Http::attach(
        'file', file_get_contents($file->getRealPath()), $file->getClientOriginalName()
    )->post('http://whisper:5000/transcribe'); // Docker内ネットワーク名に合わせる

    return view('upload-audio', ['result' => $response->json()['text'] ?? '変換失敗']);
});

require __DIR__.'/auth.php';
