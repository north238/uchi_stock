<?php

namespace App\Http\Controllers;

use App\Http\Requests\GroupSendMailRequest;
use App\Models\Group;
use App\Models\GroupUser;
use App\Models\User;
use App\Notifications\GroupJoinRequestNotification;
use App\Services\GroupService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GroupRequestController extends Controller
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
     * グループへの招待状を送信する
     */
    public function sendInvitation(GroupSendMailRequest $request, int $id): RedirectResponse
    {
        // バリデーションチェック
        $validated = $request->validated();

        // グループ情報を取得
        $group = $this->groups->getGroup($id);
        if (!$group) {
            return redirect()->back()->with('error', 'グループが見つかりません。');
        }

        // 招待状を送信するユーザーのメールアドレスを取得
        $inviterEmail = $request->user()->email;

        // 招待状を受け取るユーザーのメールアドレスを取得
        $inviteeEmail = $validated['email'];

        // バリデーションチェック
        
        // 招待するユーザーが既にグループに参加しているか確認
        $existingGroupUser = $this->groupUsers->getGroupUserByEmail($inviteeEmail, $group->id);
        if ($existingGroupUser) {
            return redirect()->back()->with('error', 'このユーザーは既にグループに参加しています。');
        }
        // 招待するユーザーが存在するか確認
        $invitee = $this->users->getUserByEmail($inviteeEmail);
        if (!$invitee) {
            return redirect()->back()->with('error', '招待するユーザーが見つかりません。');
        }

        // 招待状を送信
        $this->groupService->sendInvitation($group, $inviterEmail, $inviteeEmail);

        // 成功メッセージを表示
        return redirect()->back()->with('success', '招待状を送信しました。');
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
    public function requestToJoin(Request $request, int $id): RedirectResponse
    {
        // グループ情報を取得
        $group = $this->groups->getGroup($id);
        if (!$group) {
            return redirect()->back()->with('error', 'グループが見つかりません。');
        }

        // 申請者のメールアドレスを取得
        $applicantEmail = $request->user()->email;

        // グループ管理者のメールアドレスを取得
        $admin = $this->users->getUser($group->created_by);
        if (!$admin || !$admin->email) {
            return redirect()->back()->with('error', 'グループ管理者のメールアドレスが見つかりません。');
        }

        // メールを送信
        $admin->notify(new GroupJoinRequestNotification($group->name, $applicantEmail));

        // 成功メッセージを表示
        return redirect()->back()->with('success', 'グループ管理者に参加申請を送信しました。');
    }
}
