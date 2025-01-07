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
        Schema::create('group_requests', function (Blueprint $table) {
            $table->id(); // 主キー
            $table->unsignedBigInteger('requester_id')->comment('リクエストを送ったユーザーID');
            $table->unsignedBigInteger('group_id')->comment('対象グループID');
            $table->unsignedBigInteger('approver_id')->nullable()->comment('承認するユーザーID');
            $table->integer('status')->default(0)->comment('0: 依頼中, 1: 承認, 2: 非承認');
            $table->text('message')->nullable()->comment('リクエストに添えるメッセージ');
            $table->timestamp('expires_at')->nullable()->comment('リクエスト有効期限');
            $table->timestamps();

            // 外部キー
            $table->foreign('requester_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
            $table->foreign('approver_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_requests');
    }
};
