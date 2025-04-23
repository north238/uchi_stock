<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('roles')->insert([
            ['id' => 1, 'name' => 'system_admin', 'description' => '管理者', 'type' => 0, 'level' => 100, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'user', 'description' => '一般ユーザー', 'type' => 0, 'level' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'group_owner', 'description' => 'グループ作成者', 'type' => 1, 'level' => 80, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'group_admin', 'description' => 'グループ管理者', 'type' => 1, 'level' => 70, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'group_member', 'description' => 'グループメンバー', 'type' => 1, 'level' => 60, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
