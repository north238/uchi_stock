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
            $table->unsignedBigInteger('category_id')->comment('カテゴリID');
            $table->unsignedBigInteger('location_id')->default(1)->comment('保管場所ID_デフォルト値を未設定で設定');
            $table->integer('quantity')->default(1)->comment('数量_デフォルト値は1');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories');
            $table->foreign('genre_id')->references('id')->on('genres');
            $table->foreign('location_id')->references('id')->on('locations');
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
