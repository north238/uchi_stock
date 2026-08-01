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
        Schema::table('genres', function (Blueprint $table) {
            $table->dropForeign(['color_id']);
            $table->dropColumn('color_id');
        });

        Schema::dropIfExists('colors');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('colors', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('色名');
            $table->string('hex_code')->comment('16進数カラーコード');
            $table->timestamps();
        });

        Schema::table('genres', function (Blueprint $table) {
            $table->foreignId('color_id')->nullable()->constrained('colors')->nullOnDelete()->comment('色ID');
        });
    }
};
