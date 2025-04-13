<?php

namespace App\Http\Middleware;

use App\Models\Group;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserGroup
{
    /**
     * @var Group $group
     */
    protected $group;
    /**
     * @var User $user
     */
    protected $user;

    public function __construct(Group $group, User $user)
    {
        $this->group = $group;
        $this->user = $user;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        // 未ログインならスキップ
        if (!$user) {
            return $next($request);
        }

        // グループ未設定なら初期設定のグループを作成
        if (is_null($user->group_id)) {
            $saveData = [
                'name' => $user->name . 'さんのグループ',
                'description' => '初期設定のグループ',
                'status' => 0,
                'created_by' => $user->id,
            ];
            // グループ設定を保存
            $group = $this->group->saveGroupData($saveData);
            if (!$group) {
                return redirect()->back()->with(['error' => 'グループ設定の保存に失敗しました。']);
            }

            // ユーザーのグループIDを更新
            $this->user->updateGroupId($user->id, $group->id);

            return redirect()->route('dashboard')->with('success', 'グループの初期設定が保存されました。いつでもグループ設定を変更できます。');
        }

        return $next($request);
    }
}
