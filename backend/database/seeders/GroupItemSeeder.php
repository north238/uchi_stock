<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GroupItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('group_item')->insert([
            ['group_id' => 1, 'item_id' => 1],
            ['group_id' => 1, 'item_id' => 2],
            ['group_id' => 2, 'item_id' => 1],
            // 他のデータ
        ]);
    }
}
