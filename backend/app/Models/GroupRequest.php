<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupRequest extends Model
{
    use HasFactory;

    protected $table = 'group_requests'; // 明示的にテーブル名を指定

    protected $fillable = [
        'requester_id',
        'group_id',
        'approver_id',
        'status',
        'message',
        'expires_at',
    ];

    // リクエストを送ったユーザーとのリレーション
    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    // 承認者とのリレーション
    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    // グループとのリレーション
    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id');
    }
}
