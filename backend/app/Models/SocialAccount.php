<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocialAccount extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'provider_id',
        'provider_name',
        'access_token',
        'refresh_token',
        'user_id',
        'created_at',
        'updated_at'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    /**
     * ソーシャルユーザーが存在するか確認する
     *
     * @param string $id プロバイダーID
     * @param string $provider プロバイダー名
     * @return
     */
    public function getSocialUser($id, $provider)
    {
        $result = SocialAccount::query()
            ->where('provider_id', $id)
            ->where('provider_name', $provider)
            ->first();

        return $result;
    }
}
