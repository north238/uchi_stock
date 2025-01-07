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
            $table->unsignedBigInteger('user_id')->comment('ユーザーID');
            $table->unsignedBigInteger('genre_id')->comment('ジャンルID');
            $table->integer('quantity')->default(1)->comment('数量_デフォルト値は1');
            $table->integer('is_favorite')->default(0)->comment('お気に入りフラグ, 0:お気に入りにしていない, 1:お気に入りにしている');
            $table->string('description')->nullable()->comment('アイテムの説明');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('genre_id')->references('id')->on('genres');
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
