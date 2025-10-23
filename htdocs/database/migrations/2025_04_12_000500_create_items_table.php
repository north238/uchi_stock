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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('アイテム名');
            $table->integer('quantity')->default(1)->comment('数量');
            $table->integer('is_favorite')->default(0)->comment('お気に入りフラグ');
            $table->string('memo')->nullable()->comment('メモ');
            $table->foreignId('genre_id')->nullable()->constrained('genres')->nullOnDelete()->comment('ジャンルID'); // ジャンル削除時 NULL にする
            $table->foreignId('place_id')->nullable()->constrained('places')->nullOnDelete()->comment('保管場所ID'); // 保管場所削除時 NULL にする
            $table->foreignId('group_id')->nullable()->constrained('groups')->nullOnDelete()->comment('グループID'); // グループ削除時 NULL にする
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->comment('ユーザーID'); // ユーザー削除時 NULL にする

            $table->softDeletes()->comment('削除日時');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
