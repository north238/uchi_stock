<?php

namespace App\Http\Controllers;

use App\Http\Requests\GroupCreateRequest;
use App\Models\Group;
use App\Models\User;
use App\Notifications\GroupJoinRequestNotification;
use App\Services\GroupService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GroupController extends Controller
{
    /**
     * @var Group $group
     */
    protected $group;
    /**
     * @var User $user
     */
    protected $user;
    /**
     * @var GroupService $groupService
     */
    protected $groupService;

    public function __construct(Group $group, User $user, GroupService $groupService)
    {
        $this->group = $group;
        $this->user = $user;
        $this->groupService = $groupService;
    }

    /**
     * グループ作成画面を表示する
     */
    public function create()
    {
        // グループ設定画面を表示
        return inertia('Group/Create');
    }

    /**
     * グループ設定を保存する
     *
     * @param GroupCreateRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(GroupCreateRequest $request)
    {
        // バリデーション
        $requestData = $request->validated();

        $userId = $request->user()->id;
        $saveData = [
            'name' => $requestData['name'],
            'description' => $requestData['description'],
            'status' => $requestData['status'],
            'created_by' => $userId,
        ];
        // グループ設定を保存
        $group = $this->group->saveGroupData($saveData);
        if (!$group) {
            return redirect()->back()->with(['error' => 'グループ設定の保存に失敗しました。']);
        }

        // ユーザーのグループIDを更新
        $this->user->updateGroupId($userId, $group->id);

        // 成功メッセージを表示
        return redirect()->route('groups.edit', $group->id)->with('success', 'グループ設定が保存されました。');
    }

    /**
     * グループ編集画面を表示する
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse|\Inertia\Response
     */
    public function edit($id)
    {
        // グループ情報を取得
        $group = $this->group->find($id);
        if (!$group) {
            return redirect()->back()->with('error', 'グループが見つかりません。');
        }

        // グループ編集画面を表示
        return inertia('Group/Edit', [
            'group' => $group,
        ]);
    }

    /**
     * グループ情報を更新する
     *
     * @param GroupCreateRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(GroupCreateRequest $request, $id)
    {
        // バリデーション
        $requestData = $request->validated();

        // グループ情報を取得
        $group = $this->group->find($id);
        if (!$group) {
            return redirect()->back()->with('error', 'グループが見つかりません。');
        }

        // グループ情報を更新
        $group->update($requestData);

        // 成功メッセージを表示
        return redirect()->route('groups.edit', $group->id)->with('success', 'グループ情報が更新されました。');
    }

    /**
     * グループを削除する
     */
    public function destroy($id)
    {
        // グループ情報を取得
        $group = $this->group->find($id);
        if (!$group) {
            return redirect()->back()->with('error', 'グループが見つかりません。');
        }

        // グループを削除
        $group->delete();

        // ユーザーのグループIDをnullに更新
        $user = Auth::user();
        $this->user->updateGroupId($user->id, null);

        // 成功メッセージを表示
        return redirect()->route('dashboard')->with('success', 'グループが削除されました。');
    }

    /**
     * グループの自動生成
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function createDefaultGroup(Request $request)
    {
        $user = $request->user();
        $status = $this->groupService->initializeGroup($user);
        if ($status === false) {
            return redirect()->back()->with(['error' => 'グループ設定の保存に失敗しました。']);
        }

        redirect()->route('dashboard')->with('success', 'グループが自動生成されました。あとから編集・変更可能です');
    }

    /**
     * グループの脱退処理
     */
    public function leaveGroup($id)
    {
        // グループ情報を取得
        $group = $this->group->find($id);
        if (!$group) {
            return redirect()->back()->with('error', 'グループが見つかりません。');
        }

        // ユーザーのグループIDをnullに更新
        $userId = auth()->user()->id;
        $this->user->updateGroupId($userId, null);

        // 成功メッセージを表示
        return redirect()->route('dashboard')->with('success', 'グループから脱退しました。');
    }

    /**
     * グループへの参加を申請する
     *
     * @param Request $request
     * @param int $id グループID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function requestToJoin(Request $request, $id)
    {
        // グループ情報を取得
        $group = $this->group->find($id);
        if (!$group) {
            return redirect()->back()->with('error', 'グループが見つかりません。');
        }

        // 申請者のメールアドレスを取得
        $applicantEmail = $request->user()->email;

        // グループ管理者のメールアドレスを取得
        $admin = $this->user->find($group->created_by);
        if (!$admin || !$admin->email) {
            return redirect()->back()->with('error', 'グループ管理者のメールアドレスが見つかりません。');
        }

        // メールを送信
        $admin->notify(new GroupJoinRequestNotification($group->name, $applicantEmail));

        // 成功メッセージを表示
        return redirect()->back()->with('success', 'グループ管理者に参加申請を送信しました。');
    }
}
