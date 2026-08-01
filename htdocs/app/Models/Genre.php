<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'group_id',
    ];

    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id');
    }

    /**
     * グループIDに紐づくジャンル一覧を取得
     */
    public function getGenresListByGroupId(int $groupId)
    {
        return $this->query()
            ->where('group_id', $groupId)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * ジャンル登録
     */
    public function createGenre(array $data)
    {
        return $this->create($data);
    }
}
