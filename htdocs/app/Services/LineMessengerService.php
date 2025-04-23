<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use LINE\Clients\MessagingApi\Configuration;
use LINE\Clients\MessagingApi\Api\MessagingApiApi;
use LINE\Clients\MessagingApi\Model\ReplyMessageRequest;
use LINE\Clients\MessagingApi\Model\TextMessage;

class LineMessengerService
{
    /**
     * @var MessagingApiApi $messagingApi
     */
    protected $messagingApi;
    /**
     * @var ReplyMessageRequest $request
     */
    protected $request;

    public function __construct(ReplyMessageRequest $request)
    {
        $this->messagingApi = $this->init();
        $this->request = $request;
    }

    /**
     * Botの初期化
     */
    public function init()
    {
        // Botの初期化
        $client = new Client();
        $config = new Configuration();
        $config->setAccessToken(config('services.line.line_access_token'));
        $messagingApi = new MessagingApiApi(
            client: $client,
            config: $config,
        );

        return $messagingApi;
    }

    /**
     * LINEメッセージングAPIのメッセージ送信
     *
     * @param string $lineId LINE ID
     * @param string $text 送信するメッセージ
     * @return \LINE\Clients\MessagingApi\Model\PushMessageResponse
     */
    public function sendMessage($lineId, $text)
    {
        $message = new TextMessage([
            'type' => 'text',
            'text' => $text,
        ]);
        $request = [
            'to' => $lineId,
            'messages' => [
                $message,
            ],
        ];

        return $this->messagingApi->pushMessage($request);
    }

    /**
     * 応答メッセージを送る
     * @param $replyToken
     * @param string $text
     * @return
     */
    public function SendReplyMessage($replyToken, string $text)
    {
        $message = new TextMessage([
            'type' => 'text',
            'text' => $text,
        ]);

        $request = new ReplyMessageRequest([
            'replyToken' => $replyToken,
            'messages' => [$message],
        ]);

        return $this->messagingApi->replyMessage($request);
    }
}
