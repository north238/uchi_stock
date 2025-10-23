<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Log;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * 例外インスタンスが一度だけ報告されるべきであることを示す
     *
     * @var bool
     */
    protected $withoutDuplicates = true;

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            Log::error('システムエラー', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            // カスタムログ記録後、Laravelの標準ログ処理はスキップ
            return false;
        });

        // 招待例外処理
        // $this->renderable(function (InviteException $e, $request) {
        //     // ログに残す
        //     Log::warning($e->getMessage(), $e->getContext());
        //     // メール送信
        //     Mail::to(config('mail.admin_address'))
        //         ->send(new InviteExceptionOccurredMail($e->getMessage(), $e->getContext()));
        // });
    }
}
