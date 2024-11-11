<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    // 認証ユーザー取得
    public function getUser(Request $request)
    {

        // ユーザーが認証されているか確認
        if (!Auth::check()) {
            return response()->json(['message' => '未認証のユーザー'], 401);
        }

        $user = $request->user();
        return response()->json($user);
    }

    // ログイン
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => '認証失敗'], 401);
        }

        $user = Auth::user();
        $request->session()->regenerate();

        return response()->json([
            'message' => 'ログイン成功',
            'user' => $user
        ]);
    }

    // ログアウト
    public function logout(Request $request)
    {
        $user = Auth::user();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'ログアウト成功']);
    }

    /**
     * 新規登録
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

        if (!$user) {
            return response()->json(['message' => '認証失敗'], 401);
        }

        event(new Registered($user));
        Auth::login($user);

        return response()->json([
            'message' => '新規会員登録成功',
            'user' => $user
        ]);
    }
}
