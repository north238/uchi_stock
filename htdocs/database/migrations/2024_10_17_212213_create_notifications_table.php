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
            $table->unsignedBigInteger('user_id')->comment('ユーザーID');
            $table->unsignedBigInteger('item_id')->nullable()->comment('アイテムID');
            $table->string('message')->comment('通知メッセージ');
            $table->integer('is_read')->default(0)->comment('未読既読フラグ, 0:未読, 1:既読');
            $table->integer('status')->default(0)->comment('通知の状態, 0:作成済み, 1:送信済み, 2:処理済み');
            $table->integer('type')->default(1)->comment('通知の種類, 1:グループリクエスト承認, 2:アイテム共有など');
            $table->integer('priority')->default(1)->comment('通知の優先度, 1:通常, 2:高, 3:低');
            $table->timestamp('sent_at')->nullable()->comment('通知送信日時');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('item_id')->references('id')->on('items')->onDelete('cascade');
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
