<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{

    /**
     * @var Notification $notifications
     */
    protected $notifications;

    public function __construct(Notification $notifications)
    {
        $this->notifications = $notifications;
    }

    /**
     * 通知初期表示一覧を取得
     */
    public function index()
    {
        $userId = Auth::user()->id;
        $notifications = $this->notifications->getNotificationsToUser($userId);

        return response()->json($notifications);
    }

    /**
     * 通知の作成
     */
    public function store(Request $request)
    {
        Log::debug($request);
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'item_id' => 'required|integer',
            'message' => 'required|string',
            'status' => 'required|integer',
            'type' => 'required|integer',
            'priority' => 'required|integer',
            'sent_at' => 'required|date',
        ]);

        $notification = Notification::create($validated);

        return response()->json(['message' => '通知を作成しました', 'notification' => $notification], 201);
    }

    // 通知の承認または非承認
    public function approve(Notification $notification, Request $request)
    {
        $status = $request->input('status');
        $notification->status = $status; // ステータスを更新
        $notification->save();

        return response()->json(['message' => 'Notification updated successfully']);
    }
}
