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
            ['group_id' => 2, 'item_id' => 3],
            ['group_id' => 2, 'item_id' => 4],
            ['group_id' => 3, 'item_id' => 5],
            ['group_id' => 3, 'item_id' => 6],
            ['group_id' => 4, 'item_id' => 7],
            ['group_id' => 4, 'item_id' => 8],
            ['group_id' => 5, 'item_id' => 9],
            ['group_id' => 5, 'item_id' => 10],
            ['group_id' => 6, 'item_id' => 11],
            ['group_id' => 6, 'item_id' => 12],
            ['group_id' => 7, 'item_id' => 13],
            ['group_id' => 7, 'item_id' => 14],
            ['group_id' => 8, 'item_id' => 15],
        ]);
    }
}
