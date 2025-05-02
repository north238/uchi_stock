<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Group extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'status',
        'created_by',
    ];

    protected $dates = [
        'deleted_at'
    ];

    public function items()
    {
        return $this->hasMany(Item::class, 'group_id');
    }
    public function genres()
    {
        return $this->hasMany(Genre::class, 'group_id');
    }
    public function places()
    {
        return $this->hasMany(Place::class, 'group_id');
    }
    public function groupRequests()
    {
        return $this->hasMany(GroupRequest::class, 'group_id');
    }
    public function users()
    {
        return $this->hasMany(User::class, 'group_id');
    }
    public function groupUsers()
    {
        return $this->hasMany(GroupUser::class, 'group_id');
    }

    /**
     * グループデータの取得
     *
     * @param int $groupId グループID
     * @return \App\Models\Group|null グループデータ
     */
    public function getGroup(int $groupId): ?Group
    {
        return $this->find($groupId);
    }

    /**
     * グループデータの作成
     *
     * @param array $data 登録データの配列
     * @return \App\Models\Group 登録したグループデータ
     */
    public function createGroup(array $data): Group
    {
        return $this->create($data);
    }

    /**
     * グループデータの更新
     *
     * @param int $groupId グループID
     * @param array $data 更新データの配列
     * @return \App\Models\Group|null 更新したグループデータ
     */
    public function updateGroup(int $groupId, array $data): ?Group
    {
        $group = $this->find($groupId);
        if ($group) {
            $group->update($data);
            return $group;
        }
        return null;
    }
}
