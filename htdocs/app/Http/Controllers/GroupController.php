<?php

namespace App\Http\Controllers;

use App\Http\Requests\GroupCreateRequest;
use App\Models\Group;
use App\Models\GroupUser;
use App\Models\User;
use App\Notifications\GroupJoinRequestNotification;
use App\Services\GroupService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
     * @var GroupUser $groupUsers
     */
    protected $groupUsers;
    /**
     * @var GroupService $groupService
     */
    protected $groupService;

    public function __construct(Group $group, User $user, GroupUser $groupUsers, GroupService $groupService)
    {
        $this->group = $group;
        $this->user = $user;
        $this->groupUsers = $groupUsers;
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
        try {
            // バリデーション
            $requestData = $request->validated();

            // グループ情報を取得
            $group = $this->group->find($id);
            if (!$group) {
                throw new Exception('グループが見つかりません');
            }

            // グループ情報を更新
            $group->update($requestData);

            // 成功メッセージを表示
            return redirect()->route('groups.edit', $group->id)->with('success', 'グループ情報が更新されました。');
        } catch (Exception $e) {
            Log::error('【グループ】更新処理エラー', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'request' => $request->except(['password', '_token']),
            ]);

            return redirect()->back()->with(['error' => 'グループ更新に失敗しました。']);
        }
    }

    /**
     * グループを削除する
     */
    public function destroy($id)
    {
        try {
            // グループ情報を取得
            $group = $this->group->find($id);
            if (!$group) {
                $errorMessage = 'グループが見つかりません';
                throw new Exception($errorMessage);
            }

            // グループ内にメンバーがいる場合は削除できない
            if ($this->groupUsers->getValidGroupUsers($id)->count() > 1) {
                $errorMessage = 'グループ内にメンバーがいるため、削除できません';
                throw new Exception($errorMessage);
            }

            DB::beginTransaction();

            // グループを論理削除
            $group->delete();

            // ユーザーのグループIDをnullに更新
            $userId = Auth::user()->id;
            $this->user->updateGroupId($userId, null);

            // グループユーザーデータの削除
            $type = 'delete';
            $this->groupService->deleteGroupUser($userId, $id, $type);

            DB::commit();

            Log::info('【グループ】削除処理完了', [
                'user_id' => $userId,
                'group_id' => $id,
            ]);
            // 成功メッセージを表示
            return redirect()->route('dashboard')->with('success', 'グループが削除されました。');
        } catch (Exception $e) {
            Log::error('【グループ】削除処理エラー', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            DB::rollBack();

            return redirect()->back()->with(['error' => $errorMessage ?? 'グループ削除に失敗しました。']);
        }
    }

    /**
     * グループの自動生成
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function createDefaultGroup(Request $request)
    {
        try {
            $user = $request->user();
            // 仮グループ作成
            $status = $this->groupService->initializeGroup($user);
            if ($status === false) {
                $errorMessage = 'グループの自動生成に失敗しました';
                throw new Exception($errorMessage);
            }

            redirect()->route('dashboard')->with('success', 'グループが自動生成されました。あとから編集・変更可能です');
        } catch (Exception $e) {
            Log::error('【グループ】自動生成処理エラー', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return redirect()->back()->with(['error' => $errorMessage ?? 'グループの自動生成に失敗しました。']);
        }
    }

    /**
     * グループの脱退処理
     */
    public function leaveGroup($id)
    {
        try {
            // グループ情報を取得
            $group = $this->group->find($id);
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
            $this->user->updateGroupId($userId, null);

            // グループユーザーデータの退会処理
            $this->groupService->deleteGroupUser($userId, $id);

            Log::info('【グループ】脱退処理完了', [
                'user_id' => $userId,
                'group_id' => $id,
            ]);

            DB::commit();

            return redirect()->route('dashboard')->with('success', 'グループから脱退しました。');
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

    /**
     * グループへの参加処理
     * - 招待状からの参加
     */
    public function joinGroup($id)
    {
        //
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
