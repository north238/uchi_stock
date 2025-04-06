<?php

namespace App\Http\Controllers;

use App\Services\LineMessengerService;
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
    public function webhook(Request $request) {
        $data = $request->all();
        $events = $data['events'] ?? null;
        if (empty($events)) {
            Log::debug('No events found');
            return response()->json(['status' => 'success'], 200);
        }

        foreach ($events as $event) {
            $replyToken = $event['replyToken'] ?? null;
            switch ($event['type']) {
                case 'message':
                    $messageType = $event['message']['type'];
                    if ($messageType === 'text') {
                        $text = 'ご質問がある場合は、こちらからお問い合わせください。';
                        $response = $this->lineMessengerService->SendReplyMessage($replyToken, $text);
                    } else {
                        $text = '申し訳ありませんが、そのメッセージには対応していません。';
                        $response = $this->lineMessengerService->SendReplyMessage($replyToken, $text);
                    }
                    Log::debug($response);
                    break;
                case 'follow':
                    $text = '友達登録ありがとうございます。ご質問がある場合は、こちらからお問い合わせください。';
                    $response = $this->lineMessengerService->SendReplyMessage($replyToken, $text);
                    Log::debug($response);
                    break;
                default:
                    break;
            }
        }
        return;
    }
}
