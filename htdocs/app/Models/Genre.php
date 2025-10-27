<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'color_id',
        'group_id',
    ];

    public function color()
    {
        return $this->belongsTo(Color::class, 'color_id');
    }
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
            ->with('color')
            ->where('group_id', $groupId)
            ->orderBy('created_at', 'asc')
            ->get();
    }
}
