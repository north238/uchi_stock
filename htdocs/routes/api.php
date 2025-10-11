<?php

use App\Http\Controllers\LineMessengerController;
use App\Http\Controllers\VoiceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/voice/transcribe', [VoiceController::class, 'transcribe'])->name('api.voice.transcribe');

//LINEメッセージングAPI
Route::prefix('line')->as('line.')->group(function () {
    Route::post('/webhook', [LineMessengerController::class, 'webhook'])->name('webhook');
    Route::get('/message', [LineMessengerController::class, 'message'])->name('message');
});