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
            $table->id();
            $table->integer('status')->default(0)->comment('申請の状態：0=依頼中 1=承認 2=非承認');
            $table->foreignId('group_id')->constrained('groups')->onDelete('cascade')->comment('参加申請先のグループ');
            $table->foreignId('requester_id')->nullable()->constrained('users')->nullOnDelete()->comment('申請を送ったユーザー');
            $table->foreignId('approver_id')->nullable()->constrained('users')->nullOnDelete()->comment('申請を承認するユーザー');
            $table->timestamp('approved_at')->nullable()->comment('承認日時');
            $table->timestamps();
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
