<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use App\Services\LineMessengerService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SocialiteLoginController extends Controller
{
    /**
     * @var User $users
     */
    protected $users;
    /**
     * @var LineMessengerService $lineMessengerService
     */
    protected $lineMessengerService;

    public function __construct(User $users, LineMessengerService $lineMessengerService)
    {
        $this->users = $users;
        $this->lineMessengerService = $lineMessengerService;
    }

    /**
     * LINEログインのリダイレクト
     */
    public function lineRedirect()
    {
        return Socialite::driver('line')
            ->with(['bot_prompt' => 'aggressive'])
            ->redirect();
    }

    /**
     * LINEログインのコールバック
     */
    public function lineCallback()
    {
        $user = Socialite::driver('line')->user();

        $LineId = $user->getId();
        $lineUser = $this->users->getBylineId($LineId);

        DB::beginTransaction();
        try {
            if ($lineUser) {
                // 既存ユーザーの場合はトークンを更新
                $this->updateLineUser($user);

                Auth::login($lineUser, true);
                DB::commit();
                return redirect()->intended(RouteServiceProvider::HOME)
                    ->with('success', 'ログインに成功しました');
            } else {
                // 新規ユーザーの場合は登録処理
                $newUser = $this->createNewUser($user);

                Auth::login($newUser, true);

                // LINEにメッセージを送信
                $text = 'ご登録いただきありがとうございます！アカウント登録が完了しました。これからもよろしくお願いいたします。';
                $this->lineMessengerService->sendMessage($LineId, $text);

                DB::commit();
                return redirect()->intended(RouteServiceProvider::HOME)
                    ->with('success', 'アカウント登録が完了しました');
            }
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('【LINE】アカウント登録に失敗', ['error' => $e->getMessage()]);

            return redirect()->intended(RouteServiceProvider::HOME)
                ->with('error', 'アカウント登録に失敗しました');
        }
    }

    /**
     * 新規ユーザー登録
     *
     * @param \Laravel\Socialite\Two\User $user
     * @return \App\Models\User
     */
    private function createNewUser($user)
    {
        $newUserData = [
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'password' => null, // パスワードは不要
            'group_id' => null, // グループは未設定
            'role_id' => 2, // 一般ユーザー
            'line_id' => $user->getId(),
            'line_access_token' => $user->token,
            'line_refresh_token' => $user->refreshToken,
        ];

        $newUser = $this->users->registerUser($newUserData);

        Log::info('【LINE】新規ユーザー登録', ['user' => $newUser]);

        return $newUser;
    }

    /**
     * LINEユーザーの更新
     *
     * @param \Laravel\Socialite\Two\User $user
     * @param int $userId
     * @return \App\Models\User
     */
    private function updateLineUser($user)
    {
        $userData = [
            'line_access_token' => $user->token,
            'line_refresh_token' => $user->refreshToken,
        ];

        $this->users->updateUser($user->getId(), $userData);

        Log::info('【LINE】ユーザー情報更新', ['user' => $user]);

        return true;
    }
}
