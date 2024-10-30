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
            

            // ユーザーがいなければ登録する
            if (!) {
                $newUser = new User();
                $newUser->name = $userSocialName;
                $newUser->email = $providerUser->getEmail() ?? '000@example.com';
                $newUser->save();

                $newUserSocial = new SocialAccount();
                $newUserSocial->user_id = $newUser->id;
                $newUserSocial->provider_name = $provider;
                $newUserSocial->provider_id = $userSocialId;
                $newUserSocial->access_token = $providerUser->token;
                $newUserSocial->refresh_token = $providerUser->refreshToken;
                $newUserSocial->save();

                event(new Registered($newUser));
                Auth::login($newUser);
            }

            return response()->json($newUser);
        } catch (\Exception $e) {
            Log::error('handleProviderCallback()でエラーが発生しています。', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'LINE認証に失敗しました。'], 500);
        }
    }
}
