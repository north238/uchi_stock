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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Nette\Utils\Image;
use Throwable;

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
        $response = Socialite::driver('line')->redirect();
        $url = $response->getTargetUrl();
        // 友達追加を促すパラメータを付与
        $urlWithParam = $url . (strpos($url, '?') === false ? '?' : '&') . 'bot_prompt=aggressive';
        return redirect()->away($urlWithParam);
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

        // アバター取得・保存（失敗しても処理は継続）
        try {
            $avatarUrl = method_exists($user, 'getAvatar') ? $user->getAvatar() : ($user->avatar ?? null);
            if ($avatarUrl && filter_var($avatarUrl, FILTER_VALIDATE_URL)) {
                $savedPath = $this->downloadAndSaveAvatar($avatarUrl, $newUser->id);
                if ($savedPath) {
                    $this->users->updateUserByUserId($newUser->id, ['avatar_path' => $savedPath]);
                }
            }
        } catch (Throwable $e) {
            Log::warning('【ログイン】アバター保存失敗', ['error' => $e->getMessage(), 'user' => $newUser->id ?? null]);
        }

        Log::info('【ログイン】新規ユーザー登録', ['user' => $newUser]);

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
        $lineId = $user->getId();
        $userData = [
            'line_access_token' => $user->token,
            'line_refresh_token' => $user->refreshToken,
        ];

        $this->users->updateUserByLineId($lineId, $userData);

        // アバター更新（失敗でも処理継続）
        try {
            $avatarUrl = method_exists($user, 'getAvatar') ? $user->getAvatar() : ($user->avatar ?? null);
            if ($avatarUrl && filter_var($avatarUrl, FILTER_VALIDATE_URL)) {
                $existing = $this->users->getBylineId($lineId);
                if ($existing) {
                    $savedPath = $this->downloadAndSaveAvatar($avatarUrl, $existing->id);
                    if ($savedPath) {
                        $this->users->updateUserByUserId($existing->id, ['avatar_path' => $savedPath]);
                    }
                }
            }
        } catch (Throwable $e) {
            Log::warning('【ログイン】アバター更新失敗', ['error' => $e->getMessage(), 'line_id' => $lineId]);
        }

        Log::info('【ログイン】ユーザー情報更新', ['user' => $user]);

        return true;
    }

    /**
     * アバターをダウンロードして storage/public/users/{id} に保存する
     *
     * @param string $url
     * @param int $userId
     * @return string|null 保存した相対パス（public ディスク基準）もしくは null
     */
    private function downloadAndSaveAvatar(string $url, int $userId): ?string
    {
        try {
            $response = Http::withHeaders(['User-Agent' => 'uchi_stock/1.0'])
                ->timeout(5)
                ->get($url);

            // レスポンスチェック
            if (! $response->successful() || ! str_starts_with($response->header('Content-Type', ''), 'image/')) {
                Log::warning("【ログイン】アバター取得エラー", [
                    'user_id' => $userId,
                    'url' => $url,
                    'status' => $response->status(),
                    'content_type' => $response->header('Content-Type')
                ]);
                return null;
            }

            // 既存画像は削除
            Storage::disk('public')->deleteDirectory("users/{$userId}");

            // 画像作成
            // 縦横比維持かつアップサイズ禁止でリサイズ
            $image = Image::fromString($response->body());
            $maxSize = 512;
            $width = $image->getWidth();
            $height = $image->getHeight();

            // 比率計算
            $ratio = min($maxSize / $width, $maxSize / $height, 1); // 1以上にならないよう制限
            $newWidth = (int)($width * $ratio);
            $newHeight = (int)($height * $ratio);

            $image->resize($newWidth, $newHeight);

            // 保存先パス
            $filename = Str::uuid() . '.webp';
            $storePath = "users/{$userId}/{$filename}";

            // Storageに直接保存
            Storage::disk('public')->put($storePath, $image->toString(Image::WEBP, 80));

            return $storePath;
        } catch (Throwable $e) {
            Log::error('【ログイン】アバター保存処理エラー', [
                'user_id' => $userId,
                'url' => $url,
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);
            return null;
        }
    }
}
