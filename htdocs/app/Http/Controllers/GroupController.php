<?php

namespace App\Http\Controllers;

use App\Http\Requests\GroupCreateRequest;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;

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

    public function __construct(Group $group, User $user)
    {
        $this->group = $group;
        $this->user = $user;
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
        $saveData=[
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
        return redirect()->route('group.edit', $group->id)->with('success', 'グループ設定が保存されました。');
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
        return redirect()->route('group.edit', $group->id)->with('success', 'グループ情報が更新されました。');
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

        // 成功メッセージを表示
        return redirect()->route('dashboard')->with('success', 'グループが削除されました。');
    }
}
