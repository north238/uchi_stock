<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use LINE\Clients\MessagingApi\Configuration;
use LINE\Clients\MessagingApi\Api\MessagingApiApi;

class LineMessengerController extends Controller
{
    /**
     * @var MessagingApiApi $messagingApi
     */
    protected $messagingApi;

    public function __construct()
    {
        $this->messagingApi = $this->init();
    }

    /**
     * Botの初期化
     */
    public function init()
    {
        // Botの初期化
        $client = new Client();
        $config = new Configuration();
        $config->setAccessToken(config('line.line_access_token'));
        $messagingApi = new MessagingApiApi(
            client: $client,
            config: $config,
        );

        return $messagingApi;
    }
    /**
     * LINEメッセージングAPIのWebhook
     */
    public function webhook(Request $request)
    {
        $inputs = $request->all();
        Log::debug([
            'inputs' => $inputs,
        ]);
        return response()->json(['status' => 'success'], 200);
    }
}
