<?php

namespace App\Http\Controllers;

use App\Exceptions\Group\GroupCreationFailedException;
use App\Exceptions\Group\GroupHasMembersException;
use App\Exceptions\Group\GroupNotFoundException;
use App\Http\Requests\GroupCreateRequest;
use App\Models\Group;
use App\Models\GroupUser;
use App\Models\User;
use App\Services\GroupService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GroupController extends Controller
{
    /**
     * @var Group $groups
     */
    protected $groups;
    /**
     * @var User $users
     */
    protected $users;
    /**
     * @var GroupUser $groupUsers
     */
    protected $groupUsers;
    /**
     * @var GroupService $groupService
     */
    protected $groupService;

    public function __construct(Group $groups, User $users, GroupUser $groupUsers, GroupService $groupService)
    {
        $this->groups = $groups;
        $this->users = $users;
        $this->groupUsers = $groupUsers;
        $this->groupService = $groupService;
    }

    /**
     * グループ作成画面を表示する
     */
    public function create(): RedirectResponse|\Inertia\Response
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
    public function store(GroupCreateRequest $request): RedirectResponse
    {
        try {
            // バリデーション
            $requestData = $request->validated();

            $userId = $request->user()->id;
            $saveData = [
                'name' => $requestData['name'],
                'description' => $requestData['description'],
                'status' => $requestData['status'],
                'is_temporary' => 0, // 一時的なグループではない
                'created_by' => $userId,
            ];

            // グループ設定を保存
            $group = $this->groupService->saveGroupData($saveData);
            if (!$group) {
                throw new Exception('グループ設定の保存に失敗しました。');
            }

            // 成功メッセージを表示
            return redirect()->route('groups.edit', $group->id)->with('success', 'グループ設定が保存されました。');
        } catch (Exception $e) {
            Log::error('【グループ】作成処理エラー', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'request' => $request->except(['password', '_token']),
            ]);

            return redirect()->back()->with(['error' => 'グループ設定の保存に失敗しました。']);
        }
    }

    /**
     * グループ編集画面を表示する
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse|\Inertia\Response
     */
    public function edit(int $id): RedirectResponse|\Inertia\Response
    {
        // グループ情報を取得
        $group = $this->groups->getGroup($id);
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
    public function update(GroupCreateRequest $request, int $id): RedirectResponse
    {
        try {
            // バリデーション
            $requestData = $request->validated();

            DB::beginTransaction();

            // グループ情報を更新
            $group = $this->groups->updateGroup($id, $requestData);
            if (!$group) {
                throw new GroupNotFoundException('グループが見つかりません', 404, [
                    'group_id' => $id,
                    'request' => $request->except(['password', '_token']),
                ]);
            }

            DB::commit();

            // 成功メッセージを表示
            return redirect()->route('groups.edit', $group->id)->with('success', 'グループ情報が更新されました。');
        } catch (GroupNotFoundException $e) { // カスタム例外
            report($e);

            DB::rollBack();

            return redirect()->back()->with('error', $e->getMessage());
        } catch (Exception $e) {
            report($e);

            // トランザクションが開始されている場合はロールバック
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }

            return redirect()->back()->with('error', 'グループ更新に失敗しました。');
        }
    }

    /**
     * グループを削除する
     */
    public function destroy(int $id): RedirectResponse
    {
        try {
            // グループ情報を取得
            $group = $this->groups->getGroup($id);
            if (!$group) {
                throw new GroupNotFoundException('グループが見つかりません', 404, [
                    'group_id' => $id,
                ]);
            }

            // グループ内にメンバーがいる場合は削除できない
            if ($this->groupUsers->getValidGroupUsers($id)->count() > 1) {
                throw new GroupHasMembersException('グループ内にメンバーがいるため、削除できません', 404, [
                    'group_id' => $id,
                ]);
            }

            DB::beginTransaction();

            // グループを論理削除
            $group->delete();

            // ユーザーのグループIDをnullに更新
            $userId = Auth::user()->id;
            $this->users->updateGroupId($userId, null);

            // グループユーザーデータの削除
            $type = 'delete';
            $this->groupService->deleteGroupUser($userId, $id, $type);

            DB::commit();

            Log::info('【グループ】削除処理完了', [
                'user_id' => $userId,
                'group_id' => $id,
            ]);
            // 成功メッセージを表示
            return redirect()->route('items.index')->with('success', 'グループが削除されました。');
        } catch (GroupNotFoundException $e) { // グループが見つからない場合
            report($e);

            return redirect()->back()->with('error', $e->getMessage());
        } catch (GroupHasMembersException $e) { // グループ内にメンバーがいる場合
            report($e);

            return redirect()->back()->with('error', $e->getMessage());
        } catch (Exception $e) {
            report($e);

            DB::rollBack();

            return redirect()->back()->with('error', 'グループ削除に失敗しました。');
        }
    }

    /**
     * グループの自動生成
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function createDefaultGroup(Request $request): RedirectResponse
    {
        try {
            $user = $request->user();

            // 仮グループ作成
            $status = $this->groupService->initializeGroup($user);
            if ($status === false) {
                throw new GroupCreationFailedException('グループの自動生成に失敗しました', 404, [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                ]);
            }

            return redirect()->route('items.index')->with('success', 'グループが自動生成されました。あとから編集・変更可能です');
        } catch (GroupCreationFailedException $e) { // グループ作成エラーの場合
            report($e);

            return redirect()->back()->with('error', $e->getMessage());
        } catch (Exception $e) {
            report($e);

            return redirect()->back()->with('error', 'グループの自動生成に失敗しました。');
        }
    }

    /**
     * グループの脱退処理
     */
    public function leaveGroup(int $id): RedirectResponse
    {
        try {
            // グループ情報を取得
            $group = $this->groups->getGroup($id);
            if (!$group) {
                $errorMessage = 'グループが見つかりません';
                throw new Exception($errorMessage);
            }

            $userId = Auth::user()->id;
            // グループ作成者は脱退できない
            if ($group->created_by == $userId) {
                $errorMessage = 'グループの作成者は脱退できません';
                throw new Exception($errorMessage);
            }

            DB::beginTransaction();

            // ユーザーのグループIDをnullに更新
            $this->users->updateGroupId($userId, null);

            // グループユーザーデータの退会処理
            $this->groupService->deleteGroupUser($userId, $id);

            Log::info('【グループ】脱退処理完了', [
                'user_id' => $userId,
                'group_id' => $id,
            ]);

            DB::commit();

            return redirect()->route('items.index')->with('success', 'グループから脱退しました。');
        } catch (Exception $e) {
            Log::error('【グループ】脱退処理エラー', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            DB::rollBack();

            return redirect()->back()->with(['error' => $errorMessage ?? 'グループからの脱退に失敗しました。']);
        }
    }
}
