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
        Schema::create('group_item', function (Blueprint $table) {
            $table->unsignedBigInteger('item_id')->comment('アイテムID');
            $table->unsignedBigInteger('group_id')->comment('グループID');

            $table->foreign('item_id')->references('id')->on('items')->onDelete('cascade');
            $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');

            $table->primary(['item_id', 'group_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_item');
    }
};
