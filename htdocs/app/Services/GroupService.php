<?php

namespace App\Services;

use App\Models\Group;
use App\Models\GroupUser;
use App\Models\User;

class GroupService
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
     * グループの初期設定を行う
     *
     * @param User $user
     * @return bool true|false
     */
    public function initializeGroup(User $user): bool
    {
        $saveData = [
            'name' => $user->name . 'さんのグループ',
            'description' => '自動生成された個人グループ',
            'status' => 0,
            'is_temporary' => 1, //一時的なグループ
            'created_by' => $user->id,
        ];
        // グループ設定を保存
        $group = $this->saveGroupData($saveData);
        if (!$group) {
            return false;
        }

        // ユーザーのグループIDを更新
        $this->users->updateGroupId($user->id, $group->id);

        return true;
    }

    /**
     * グループデータ保存処理
     *
     * @param array $data 登録データの配列
     * @return \App\Models\Group 登録したグループデータ
     */
    public function saveGroupData(array $data): Group
    {
        // グループデータを作成する
        $group = $this->groups->createGroup($data);

        // ユーザーのグループIDを更新
        $userId = $data['created_by'];
        $this->users->updateGroupId($userId, $group->id);

        // グループユーザーの作成
        $this->createGroupUsers($userId, $group->id);

        return $group;
    }

    /**
     * グループユーザーデータの作成
     * - グループ作成者として登録
     *
     * @param int $userId ユーザーID
     * @param int $groupId グループID
     * @return void
     */
    private function createGroupUsers(int $userId, int $groupId): void
    {
        // グループユーザーデータを作成する
        $saveData = [
            'user_id' => $userId,
            'group_id' => $groupId,
            'role_id' => 3, // グループ作成者
            'status' => 1, // 承認済み
            'approved_at' => now(),
        ];
        $this->groupUsers->createGroupUser($saveData);

        return;
    }

    /**
     * グループユーザー削除処理
     *
     * @param int $userId ユーザーID
     * @param int $groupId グループID
     * @return bool true|false
     */
    public function deleteGroupUser(int $userId, int $groupId, string $type = 'leave'): bool
    {
        $groupUser = $this->groupUsers->getGroupUser($userId, $groupId);
        // グループユーザーデータが存在する場合
        if ($groupUser) {
            $saveData = $this->groupUserType($type);
            $saveData['user_id'] = $userId;
            $saveData['group_id'] = $groupId;

            // グループデータ更新
            $groupUser->upDateGroupUser($saveData);

            return true;
        }

        return false;
    }

    /**
     * グループユーザー処理の判断
     */
    public function groupUserType(string $type): array
    {
        // グループユーザーの処理を判断する
        switch ($type) {
            case 'leave':
                return [
                    'status' => 9, // 退会
                    'left_at' => now(),
                ];
            case 'delete':
                return [
                    'status' => 8, // 管理者削除
                    'left_at' => now(),
                ];
            default:
                return [];
        }
    }
}
