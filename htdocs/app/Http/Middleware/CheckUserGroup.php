<?php

namespace App\Http\Middleware;

use App\Models\Group;
use App\Models\User;
use App\Services\GroupService;
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
    /**
     * @var GroupService $groupService
     */
    protected $groupService;

    public function __construct(Group $group, User $user, GroupService $groupService)
    {
        $this->group = $group;
        $this->user = $user;
        $this->groupService = $groupService;
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
            $this->groupService->initializeGroup($user);
        }

        return $next($request);
    }
}
