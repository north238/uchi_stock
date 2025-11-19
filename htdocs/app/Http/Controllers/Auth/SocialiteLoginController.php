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
        } catch (\Throwable $e) {
            Log::warning('【LINE】アバター保存失敗', ['error' => $e->getMessage(), 'user' => $newUser->id ?? null]);
        }

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
        $lineId = $user->getId();
        $userData = [
            'line_access_token' => $user->token,
            'line_refresh_token' => $user->refreshToken,
        ];

        $this->users->updateUserByLineId($lineId, $userData);

        // アバター更新（オプション）
        try {
            $avatarUrl = method_exists($user, 'getAvatar') ? $user->getAvatar() : ($user->avatar ?? null);
            if ($avatarUrl && filter_var($avatarUrl, FILTER_VALIDATE_URL)) {
                // users->getBylineId 等でユーザーIDを取得するユーティリティを利用
                $existing = $this->users->getBylineId($lineId);
                Log::debug($existing);
                if ($existing) {
                    $savedPath = $this->downloadAndSaveAvatar($avatarUrl, $existing->id);
                    Log::debug($savedPath);
                    if ($savedPath) {
                        $this->users->updateUserByUserId($existing->id, ['avatar_path' => $savedPath]);
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('【LINE】アバター更新失敗', ['error' => $e->getMessage(), 'line_id' => $lineId]);
        }

        Log::info('【LINE】ユーザー情報更新', ['user' => $user]);

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
        $response = Http::withHeaders(['User-Agent' => 'uchi_stock/1.0'])
            ->timeout(5)
            ->get($url);

        Log::debug('Avatar download response', [
            'status' => $response->status(),
            'headers' => $response->headers(),
        ]);

        if (! $response->successful()) {
            return null;
        }

        $contentType = $response->header('Content-Type', '');
        if (! str_starts_with($contentType, 'image/')) {
            return null;
        }

        // 既存画像は一括削除して最新だけ保持
        Storage::disk('public')->deleteDirectory("users/{$userId}");

        try {
            // ★1: LINE画像を読み込み（MIME偽装があってもOK）
            $image = Image::fromString($response->body());

            // ★2: 最大512pxにリサイズ（縦横比維持、アップサイズ禁止）
            $image->resize(512, 512, Image::SHRINK_ONLY);

            // ★3: WebPに統一して保存
            $uuid = Str::uuid()->toString();
            $filename = "{$uuid}.webp";
            $storePath = "users/{$userId}/{$filename}";

            // 一時ファイルへ保存してから Storage へ
            $tempPath = storage_path("app/tmp_{$uuid}.webp");
            $image->save($tempPath, 80, Image::WEBP);
            // ┗ 品質80は一般的に高品質で軽量

            Storage::disk('public')->put($storePath, file_get_contents($tempPath));

            if (file_exists($tempPath)) {
                try {
                    unlink($tempPath);
                } catch (Throwable $e) {
                    Log::warning("Temporary avatar file delete failed: {$tempPath}", [
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            return $storePath;
        } catch (Exception $e) {
            Log::error('Avatar processing failed', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
                'url' => $url,
            ]);
            return null;
        }
    }
}
