<?php

namespace App\Services;

use App\Models\Group;
use App\Models\User;

class GroupService
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
            'is_temporary' => 1,
            'created_by' => $user->id,
        ];
        // グループ設定を保存
        $group = $this->group->saveGroupData($saveData);
        if (!$group) {
            return false;
        }

        // ユーザーのグループIDを更新
        $this->user->updateGroupId($user->id, $group->id);

        return true;
    }
}
