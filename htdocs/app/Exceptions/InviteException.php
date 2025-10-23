<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Support\Facades\Log;

class InviteException extends Exception
{
    protected int $statusCode;
    protected array $context;

    public function __construct(string $message, int $statusCode = 400, array $context = [])
    {
        parent::__construct($message);
        $this->statusCode = $statusCode;
        $this->context    = $context;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
    public function getContext(): array
    {
        return $this->context;
    }

    /**
     * 例外を報告
     */
    public function report(): void
    {
        // ログに残す
        Log::error('招待関連エラー', [
            'message' => $this->getMessage(),
            'context' => $this->context,
        ]);
    }
}
