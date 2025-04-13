<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserGroup
{
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

        // グループ未設定ならリダイレクト
        if (is_null($user->group_id)) {
            return redirect()->route('group.setup'); // グループ作成 or 参加ページ
        }

        return $next($request);
    }
}
