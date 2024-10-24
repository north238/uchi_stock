<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // ログイン
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;
            return response()->json([
                'message' => 'ログイン成功',
                'token' => $token,
                'user' => $user
            ]);
        } else {
            return response()->json(['message' => '認証失敗'], 401);
        }
    }

    // ログアウト
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'ログアウト成功']);
    }

    // 認証ユーザー取得
    public function getUser(Request $request)
    {
        return response()->json($request->user());
    }
}
