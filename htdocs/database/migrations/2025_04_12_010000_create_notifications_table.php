<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('title')->comment('通知タイトル');
            $table->string('message')->comment('通知メッセージ');
            $table->integer('type')->comment('通知タイプ：1:お知らせ, 2:メッセージ, 3:アラート');
            $table->boolean('is_read')->default(false)->comment('既読フラグ');
            $table->timestamp('read_at')->nullable()->comment('既読日時');

            $table->foreignId('user_id')->constrained('users')->comment('ユーザーID');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
