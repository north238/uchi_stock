<?php

namespace App\Http\Middleware;

use App\Models\Group;
use App\Models\User;
use App\Services\GroupService;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
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

        // グループが設定されていない場合モーダル表示（グループ作成画面を除く）
        Inertia::share([
            'showGroupModal' => is_null(auth()->user()->group_id) && (!$request->routeIs('groups.create') || !$request->routeIs('groups.store')),
        ]);

        return $next($request);
    }
}
