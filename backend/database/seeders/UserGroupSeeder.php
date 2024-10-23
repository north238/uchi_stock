<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('user_group')->insert([
            [
                'user_id' => 1,
                'group_id' => 1,
            ],
            [
                'user_id' => 2,
                'group_id' => 1,
            ],
            [
                'user_id' => 1,
                'group_id' => 2,
            ],
            // 他のデータ
        ]);
    }
}
