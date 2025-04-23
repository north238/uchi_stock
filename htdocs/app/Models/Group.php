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

    /**
     * グループデータ保存処理
     *
     * @param array $data 登録データの配列
     * @return \App\Models\Group 登録したグループデータ
     */
    public function saveGroupData(array $data): Group
    {
        // バリデーションを行う
        // $validatedData = $this->validateGroupData($data);

        // グループデータを保存する
        $group = $this->createGroup($data);

        return $group;
    }

    /**
     * グループデータの作成
     *
     * @param array $data 登録データの配列
     * @return \App\Models\Group 登録したグループデータ
     */
    private function createGroup(array $data): Group
    {
        $group = $this->create([
            'name' => $data['name'],
            'description' => $data['description'],
            'status' => $data['status'],
            'is_temporary' => 0,
            'created_by' => $data['created_by'],
        ]);

        return $group;
    }
}
