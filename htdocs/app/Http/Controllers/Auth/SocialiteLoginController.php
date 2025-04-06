<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use App\Services\LineMessengerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use SocialiteProviders\Manager\Config as Config;

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

        $userId = $user->getId();
        $lineUser = $this->users->getBylineId($userId);
        if ($lineUser) {
            $userData = [
                'line_access_token' => $user->token,
                'line_refresh_token' => $user->refreshToken,
            ];
            $lineUser->update($userData);

            Auth::login($lineUser, true);
            return redirect()->intended(RouteServiceProvider::HOME)
                ->with('success', 'ログインに成功しました');
        } else {
            $newUserData = [
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                'line_id' => $userId,
                'line_access_token' => $user->token,
                'line_refresh_token' => $user->refreshToken,
            ];

            $newUser = $this->users->registerUser($newUserData);

            Log::info('新規ユーザー登録', ['user' => $newUser]);
            Auth::login($newUser, true);
            $text = 'アカウント登録が完了しました';
            $this->lineMessengerService->sendMessage($userId, $text);

            return redirect()->intended(RouteServiceProvider::HOME)
                ->with('success', 'アカウント登録が完了しました');
        }
    }
}
