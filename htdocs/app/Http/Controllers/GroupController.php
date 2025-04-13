<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class GroupController extends Controller
{
    /**
     * グループ設定画面を表示する
     */
    public function setup(Request $request)
    {
        // ユーザーが所属しているグループを取得
        $user = $request->user();
        $groups = $user->groups;

        // グループ設定画面を表示
        return inertia('Group/Setup', [
            'groups' => $groups,
        ]);
    }
}
