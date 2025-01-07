<?php

namespace App\Http\Controllers;

use App\Models\GroupRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GroupRequestController extends Controller
{
    // コンストラクタ: 認証を強制
    public function __construct()
    {
        $this->middleware('auth');
    }

    // グループリクエストの作成
    public function create(Request $request)
    {
        $validated = $request->validate([
            'group_id' => 'required|exists:groups,id',
            'message' => 'nullable|string|max:255',
        ]);

        $groupRequest = GroupRequest::create([
            'requester_id' => Auth::id(),
            'group_id' => $validated['group_id'],
            'message' => $validated['message'] ?? null,
            'status' => 0, // 依頼中
        ]);

        return response()->json($groupRequest, 201);
    }

    // 承認または非承認
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:1,2', // 承認(1), 非承認(2)
        ]);

        $groupRequest = GroupRequest::findOrFail($id);

        // 承認者が正しいか確認
        if ($groupRequest->group->approver_id !== Auth::id()) {
            return response()->json(['error' => '不正なアクセスです。'], 403);
        }

        $groupRequest->status = $validated['status'];
        $groupRequest->approver_id = Auth::id(); // 承認者を設定
        $groupRequest->save();

        // 承認された場合、user_groupsテーブルに追加
        if ($groupRequest->status === 1) {
            $groupRequest->group->users()->attach($groupRequest->requester_id);
        }

        return response()->json($groupRequest);
    }

    // グループリクエストの一覧取得（例えば、承認待ちリスト）
    public function index()
    {
        $requests = GroupRequest::where('status', 0)->get(); // 依頼中のリスト
        return response()->json($requests);
    }
}
