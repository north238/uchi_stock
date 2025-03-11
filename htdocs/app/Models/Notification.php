<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'item_id',
        'user_id',
        'message',
        'is_read',
        'status',
        'type',
        'priority',
        'sent_at',
        'created_at',
        'updated_at'
    ];

    public function item() {
        return $this->belongsTo(Item::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    /**
     * ユーザーに紐づく通知を取得
     *
     * @param int $userId ユーザーID
     * @return Notification[] 通知一覧
     */
    public function getNotificationsToUser($userId)
    {
        $result = Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return $result;
    }
}
