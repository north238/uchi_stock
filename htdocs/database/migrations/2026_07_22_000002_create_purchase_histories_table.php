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
        Schema::create('purchase_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->cascadeOnDelete(); // アイテム削除で履歴も削除
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // ユーザー削除で NULL
            $table->dateTime('purchased_at');
            $table->timestamps();
            $table->index(['item_id', 'purchased_at']); // 前回購入の集約用
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_histories');
    }
};
