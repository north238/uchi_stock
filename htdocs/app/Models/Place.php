<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Place extends Model
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
     * グループIDに紐づく保管場所一覧を取得
     */
    public function getPlacesListByGroupId(int $groupId)
    {
        return $this->query()
            ->where('group_id', $groupId)
            ->orderBy('created_at', 'asc')
            ->get();
    }
}
