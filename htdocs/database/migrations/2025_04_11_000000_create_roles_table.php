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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique()->comment('役割名');
            $table->string('description')->nullable()->comment('役割の説明');
            $table->integer('type')->default(0)->comment('役割の種類：0=システム 1=グループ');
            $table->integer('level')->default(0)->comment('役割レベル：100=管理者 10=一般 0=退会');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
