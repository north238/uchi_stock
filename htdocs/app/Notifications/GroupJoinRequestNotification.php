<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class GroupJoinRequestNotification extends Notification
{
    use Queueable;

    /**
     * @var string
     */
    protected string $groupName;
    /**
     * @var string
     */
    protected string $applicantEmail;
    /**
     * @var string
     */
    protected string $token;
    /**
     * Create a new notification instance.
     */
    public function __construct($groupName, $applicantEmail, $token = null)
    {
        $this->groupName = $groupName;
        $this->applicantEmail = $applicantEmail;
        $this->token = $token;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $approveUrl = route('groups.request.approve', ['token' => $this->token]);
        $rejectUrl = route('groups.request.reject', ['token' => $this->token]);

        return (new MailMessage)
            ->subject(Lang::get('グループ参加申請の確認'))
            ->line(Lang::get("下記のユーザーがグループ「{$this->groupName}」への参加を申請をしました。"))
            ->line(Lang::get("申請者のメールアドレス：{$this->applicantEmail}"))
            ->line(Lang::get("申請日時：{$this->applicantEmail}"))
            ->line(Lang::get('以下のリンクから申請または拒否してください。'))
            ->action(Lang::get('申請の承認する'), $approveUrl)
            ->line(Lang::get('または'))
            ->action(Lang::get('申請の拒否する'), $rejectUrl);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
