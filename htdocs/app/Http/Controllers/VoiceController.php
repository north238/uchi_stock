<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class VoiceController extends Controller
{
    /**
     * 音声入力画面を表示
     */
    public function create()
    {
        return Inertia::render('Voice/Create');
    }

    /**
     * 音声をWhisperで文字起こし
     */
    public function transcribe(Request $request)
    {
        $request->validate([
            'audio' => 'required|file|mimes:wav,mp3,m4a,webm|max:20480',
        ]);

        $file = $request->file('audio');

        try {
            // WhisperコンテナへPOST
            $response = Http::timeout(180)->attach(
                'file',
                file_get_contents($file->getRealPath()),
                $file->getClientOriginalName()
            )->post('http://whisper:5000/transcribe');

            Log::debug($response->body());

            if ($response->successful()) {
                $text = $response->json()['text'] ?? '変換結果を取得できませんでした';
            } else {
                $text = 'Whisperサーバーからエラー応答がありました';
            }
        } catch (\Exception $e) {
            $text = '通信エラー: ' . $e->getMessage();
        }

        return response()->json([
            'text' => $text,
        ]);
    }
}
