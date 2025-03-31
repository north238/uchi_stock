<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;

class CustomResetPassword extends BaseResetPassword
{
    /**
     * Create a new notification instance.
     */
    public function __construct($token)
    {
        parent::__construct($token);
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('パスワードリセットのご案内')
            ->greeting('ご利用いただきありがとうございます。')
            ->line('パスワードリセットのリクエストを受け付けました。以下のボタンをクリックしてください。')
            ->action('パスワードをリセット',  $this->resetUrl($notifiable))
            ->line('このリクエストを送信していない場合は、このメールを無視してください。');
    }
}
