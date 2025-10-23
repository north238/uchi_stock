<?php

namespace App\Services;

use App\Models\Group;
use App\Models\GroupUser;
use App\Models\User;

class GroupRequestService
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

    public function __construct(Group $groups, User $users, GroupUser $groupUsers)
    {
        $this->groups = $groups;
        $this->users = $users;
        $this->groupUsers = $groupUsers;
    }

    /**
     * グループへの招待状を送信する
     *
     * @param int $groupId グループID
     * @param string $inviterEmail 招待者のメールアドレス
     * @param string $inviteeEmail 招待されるユーザーのメールアドレス
     * @return bool true|false
     */
    public function sendInvitation(int $groupId, string $inviterEmail, string $inviteeEmail): bool
    {
        // グループ情報を取得
        $group = $this->groups->getGroup($groupId);
        if (!$group) {
            return false;
        }

        // 招待状を受け取るユーザーの情報を取得
        $invitee = $this->users->getUserByEmail($inviteeEmail);
        if (!$invitee) {
            return false;
        }

        // 招待状を送信する処理（例: メール送信）
        // ここでは簡略化のため、実際のメール送信処理は省略します

        return true;
    }

    /**
     * 招待状を送信する
     */
    public function sendInvitation($group, string $inviterEmail, string $inviteeEmail): bool
    {
        // 招待状を送信する処理
        // DBにメールアドレスが存在するか確認
        // ある場合はメール送信
        // ない場合はエラー処理

        return true;
    }
}
