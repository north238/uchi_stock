<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ItemTagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('item_tag')->insert([
            ['item_id' => 1, 'tag_id' => 1],
            ['item_id' => 1, 'tag_id' => 2],
            ['item_id' => 2, 'tag_id' => 1],
            // 他のデータ
        ]);
    }
}
