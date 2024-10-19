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
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->comment('ユーザーID');
            $table->string('provider_name')->comment('プロバイダー名');
            $table->string('provider_id')->comment('プロバイダーID');
            $table->string('access_token')->nullable()->comment('アクセストークン');
            $table->string('refresh_token')->nullable()->comment('リフレッシュトークン');
            $table->timestamps();

            $table->unique(['provider_name', 'provider_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_accounts');
    }
};
