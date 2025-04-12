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
        Schema::create('genres', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('ジャンル名');
            $table->foreignId('color_id')->nullable()->constrained('colors')->nullOnDelete()->comment('色ID'); // 色削除時 NULL にする
            $table->foreignId('group_id')->nullable()->constrained('groups')->nullOnDelete()->comment('グループID');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('genres');
    }
};
