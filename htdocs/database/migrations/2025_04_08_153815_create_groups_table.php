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
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('グループ名');
            $table->string('description')->nullable()->comment('グループ説明');
            $table->integer('status')->default(0)->comment('グループステータス：0=非公開、1=公開、2=非表示');
            $table->integer('created_by')->default(0)->comment('作成者ID：デフォルトは未設定');
            $table->integer('is_temporary')->default(0)->comment('一時的なグループ：0=通常、1=一時的');

            $table->softDeletes()->comment('削除日時');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('groups');
    }
};
