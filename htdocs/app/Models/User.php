<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Notifications\CustomResetPassword;
use App\Notifications\CustomVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'group_id',
        'line_id',
        'line_access_token',
        'line_refresh_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'line_access_token',
        'line_refresh_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * 実行ユーザーのパスワードチェックに使用
     */
    protected $appends = ['is_password_set'];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    /**
     * パスワードが設定されているか
     *
     * @return bool
     */
    public function getIsPasswordSetAttribute()
    {
        return !is_null($this->password);
    }

    /**
     * LINE ID からユーザーを取得
     */
    public function getBylineId(string $lineId)
    {
        return $this->where('line_id', $lineId)->first();
    }

    /**
     * ユーザー登録
     */
    public function registerUser(array $userData)
    {
        return $this->create($userData);
    }

    /**
     * グループIDを更新
     *
     * @param int $userId
     * @param int|null $groupId
     * @return int
     */
    public function updateGroupId(int $userId, ?int $groupId)
    {
        return $this->where('id', $userId)->update(['group_id' => $groupId]);
    }

    /**
     * 新規登録メールカスタム
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmail());
    }

    /**
     * パスワードリセットメールのカスタム
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPassword($token));
    }
}
