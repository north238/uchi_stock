<?php

namespace App\Http\Controllers;

use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SocialAccountController extends Controller
{
    /**
     * @var SocialAccount $socialAccount
     */
    protected $socialAccount;

    public function __construct(SocialAccount $socialAccount)
    {
        $this->socialAccount = $socialAccount;
    }

    /**
     * 各種SNSから認証をする
     *
     * @param string $provider プロバイダー名
     * @return
     */
    public function socialLogin() {
        $redirectUrl = Socialite::driver('line')->redirect()->getTargetUrl();
        return response()->json(['url' => $redirectUrl]);
    }

    /**
     * ユーザー登録と認証
     * @return
     */
    public function handleProviderCallback()
    {
        try {
            $provider = 'line';
            $providerUser = Socialite::driver($provider)->user();
            $userSocialId = $providerUser->getId();
            $userSocialName = $providerUser->getName();
            $userSocialAvatar = $providerUser->getAvatar() ?? null;
            $socialUser = $this->socialAccount->getSocialUser($userSocialId, $provider);

            // ユーザーがなければ登録する
            if (!$socialUser) {
                $newUser = new User();
                $newUser->name = $userSocialName;
                $newUser->email = $providerUser->getEmail();
                $newUser->save();

                $newUserSocial = new SocialAccount([
                    'user_id' => $newUser->id,
                    'provider_id' => $userSocialId,
                    'provider_name' => $provider,
                    'avatar' => $userSocialAvatar,
                    'access_token' => $providerUser->token,
                    'refresh_token' => $providerUser->refreshToken,
                ]);
                $newUserSocial->save();

                event(new Registered($newUser));
                Auth::login($newUser);
                return redirect()->away(env('FRONTEND_URL') . "/line-login-success?user=$newUser");
            }

            // ユーザー情報を取得
            $user = $socialUser->user;
            Auth::login($user);
            return redirect()->away(env('FRONTEND_URL') . "/line-login-success?user=$user");

        } catch (\Exception $e) {
            Log::error('handleProviderCallback()でエラーが発生しています。', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'LINE認証に失敗しました。'], 500);
        }
    }
}
