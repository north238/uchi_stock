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
        $apiUrl = route('api.voice.transcribe');
        return Inertia::render('Voice/Create', [
            'apiUrl' => $apiUrl,
        ]);
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
        $whisperUrl = config('services.whisper.url');

        try {
            // WhisperサーバーへPOST
            $response = Http::timeout(180)->attach(
                'file',
                file_get_contents($file->getRealPath()),
                $file->getClientOriginalName()
            )->post($whisperUrl);

            $data = $response->json();

            if ($response->successful() && isset($data['status']) && $data['status'] === 'success') {
                $text = $data['data']['input'] ?? '音声を認識できませんでした';
                $items = $data['data']['items'] ?? [];
                $message = $data['message'] ?? '音声解析に成功しました。';
            } elseif (isset($data['status']) && $data['status'] === 'error') {
                // FastAPI側が400や500エラーを返したケース
                $text = $data['input'] ?? '（入力を取得できません）';
                $items = [];
                $message = $data['message'] ?? '音声解析に失敗しました。';
            } else {
                // 想定外レスポンス
                $text = 'Whisperサーバーから予期しない応答がありました。';
                $items = [];
                $message = '解析処理に失敗しました。';
            }
        } catch (\Exception $e) {
            Log::error('【音声解析】システムエラー', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            $text = '通信エラーが発生しました。';
            $items = [];
            $message = 'Whisperサーバーとの通信に失敗しました。';
        }

        return response()->json([
            'status' => isset($data['status']) ? $data['status'] : 'error',
            'message' => $message,
            'input' => $text,
            'items' => $items,
        ]);
    }
}
