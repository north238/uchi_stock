<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialiteLoginController extends Controller
{
    /**
     * @var User $users
     */
    protected $users;

    public function __construct(User $users)
    {
        $this->users = $users;
    }

    /**
     * LINEログインのリダイレクト
     */
    public function lineRedirect()
    {
        return Socialite::driver('line')->redirect();
    }

    /**
     * LINEログインのコールバック
     */
    public function lineCallback()
    {
        $user = Socialite::driver('line')->user();

        $lineUser = $this->users->getBylineId($user->getId());
        dd($lineUser);
        if ($lineUser) {
            Auth::login($lineUser, true);
            return redirect()->intended(RouteServiceProvider::HOME);
        } else {
            $newUser = new User();
            $newUser->name = $user->getName();
            $newUser->email = $user->getEmail();
            $newUser->line_id = $user->getId();
            $newUser->save();
            Auth::login($newUser, true);
            return redirect()->intended(RouteServiceProvider::HOME);
        }
    }
}
