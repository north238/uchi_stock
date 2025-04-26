<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'group_id',
        'role_id',
        'status',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'left_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * リレーション設定
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id');
    }
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * グループユーザーデータ取得
     *
     * @param int $userId ユーザーID
     * @param int $groupId グループID
     * @return \App\Models\GroupUser|null グループユーザーデータ
     */
    public function getGroupUser(int $userId, int $groupId): ?GroupUser
    {
        return $this->where('user_id', $userId)
            ->where('group_id', $groupId)
            ->first();
    }

    /**
     * グループユーザーデータの作成
     *
     * @param array $data 登録データの配列
     * @return \App\Models\GroupUser 登録したグループユーザーデータ
     */
    public function createGroupUser(array $data): ?GroupUser
    {
        return $this->create($data);
    }

    /**
     * グループユーザーデータの更新
     *
     * @param array $data 更新データの配列
     * @return bool true|false
     */
    public function updateGroupUser(array $data): bool
    {
        return $this->where('user_id', $data['user_id'])
            ->where('group_id', $data['group_id'])
            ->update($data);
    }

    /**
     * 有効なグループユーザーを取得
     */
    public function getValidGroupUsers(int $groupId): Collection
    {
        return $this->where('group_id', $groupId)
            ->where('status', 1)
            ->get();
    }
}
