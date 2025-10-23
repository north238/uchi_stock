<?php

namespace App\Exceptions\Group;

use Exception;
use Illuminate\Support\Facades\Log;

class BaseGroupException extends Exception
{
    protected int $statusCode;
    protected array $context;

    public function __construct(string $message, int $statusCode = 400, array $context = [])
    {
        parent::__construct($message);
        $this->statusCode = $statusCode;
        $this->context    = $context;
    }

    /**
     * ログ出力時のプレフィックス（子クラスで上書き）
     */
    protected function getLogPrefix(): string
    {
        return '[GroupError] ';
    }

    /**
     * HTTPステータスコード取得
     */
    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    /**
     * コンテキスト取得（ログ出力用）
     */
    public function getContext(): array
    {
        return $this->context;
    }

    /**
     * 例外を報告
     */
    public function report(): void
    {
        Log::error('【グループ】', [
            'prefix' => $this->getLogPrefix(),
            'message' => $this->getMessage(),
            'context' => $this->context,
            'statusCode' => $this->statusCode,
        ]);
    }
}
