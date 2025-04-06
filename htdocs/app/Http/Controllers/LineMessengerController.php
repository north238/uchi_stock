<?php

namespace App\Http\Controllers;

use App\Services\LineMessengerService;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use LINE\Clients\MessagingApi\Api\MessagingApiApi;
use LINE\Clients\MessagingApi\Model\ReplyMessageRequest;
use LINE\Clients\MessagingApi\Model\TextMessage;

class LineMessengerController extends Controller
{
    /**
     * @var MessagingApiApi $messagingApi
     */
    protected $messagingApi;
    /**
     * @var ReplyMessageRequest $request
     */
    protected $request;
    /**
     * @var LineMessengerService $lineMessengerService
     */
    protected $lineMessengerService;

    public function __construct(ReplyMessageRequest $request, LineMessengerService $lineMessengerService)
    {
        $this->request = $request;
        $this->lineMessengerService = $lineMessengerService;
    }

    // /**
    //  * LINEメッセージングAPIのWebhook
    //  */
    // public function webhook(Request $request)
    // {
    //     $inputs = $request->all();
    //     Log::debug([
    //         'inputs' => $inputs,
    //     ]);
    //     return response()->json(['status' => 'success'], 200);
    // }

    /**
     * メッセージを送信する
     */
    public function webhook(Request $request)
    {
        $data = $request->all();
        $events = $data['events'] ?? null;
        if (empty($events)) {
            Log::warning('イベントがありません', ['data' => $data]);
            return response()->json(['status' => 'success'], 200);
        }

        foreach ($events as $event) {
            $replyToken = $event['replyToken'] ?? null;
            $text = null;

            if (empty($replyToken)) {
                Log::warning('リプライトークンなし', ['event' => $event]);
                continue;
            }

            // イベントの種類により処理を分岐
            switch ($event['type']) {
                case 'message':
                    $messageType = $event['message']['type'];

                    // メッセージの種類により処理を分岐
                    $text = ($messageType === 'text')
                        ? 'お問い合わせありがとうございます。自動返信機能は現在開発中です。'
                        : '申し訳ありませんが、そのメッセージには対応していません。';
                    break;
                case 'follow':
                    $text = 'お友達登録ありがとうございます。ご質問がある場合は、こちらからお問い合わせください。';
                    break;
                default:
                    continue 2;
            }

            if (empty($text)) {
                Log::warning('メッセージテキストの生成に失敗', ['event' => $event]);
                continue;
            }

            try {
                $response = $this->lineMessengerService->SendReplyMessage($replyToken, $text);
                Log::info('LINEメッセージ送信', [
                    'response' => $response,
                    'replyToken' => $replyToken
                ]);
            } catch (Exception $e) {
                Log::error('LINEメッセージ送信失敗', [
                    'message' => $e->getMessage(),
                    'replyToken' => $replyToken,
                    'event' => $event,
                ]);
            }
        }
        return response()->json(['status' => 'success'], 200);
    }
}
