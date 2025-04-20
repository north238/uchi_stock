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
        Schema::create('group_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->comment('ユーザーID');
            $table->foreignId('group_id')->constrained('groups')->onDelete('cascade')->comment('グループID');
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade')->comment('役割ID'); // グループ内の役割
            $table->integer('status')->default(0)->comment('状態：0=申請中 1=承認 2=拒否 9=退会');
            $table->timestamp('approved_at')->nullable()->comment('承認日時');
            $table->timestamp('rejected_at')->nullable()->comment('拒否日時');
            $table->timestamp('left_at')->nullable()->comment('退会日時');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_users');
    }
};
