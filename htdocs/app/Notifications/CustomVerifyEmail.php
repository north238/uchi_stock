<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Lang;
use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;

class CustomVerifyEmail extends BaseVerifyEmail
{

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject(Lang::get('メールアドレスの確認'))
            ->greeting('ご利用いただきありがとうございます。')
            ->line(Lang::get('メールアドレスを確認するには、以下のボタンをクリックしてください。'))
            ->action(Lang::get('メールアドレスの確認'), $this->verificationUrl($notifiable))
            ->line(Lang::get('このリクエストを送信していない場合は、このメールを無視してください。'));
    }
}
