<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ColorsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $colors = [
            // Red
            ['name' => 'red:50', 'hex_code' => '#FFEBEE', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'red:100', 'hex_code' => '#FFCDD2', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'red:200', 'hex_code' => '#EF9A9A', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'red:300', 'hex_code' => '#E57373', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'red:400', 'hex_code' => '#EF5350', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'red:500', 'hex_code' => '#F44336', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'red:600', 'hex_code' => '#E53935', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'red:700', 'hex_code' => '#D32F2F', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'red:800', 'hex_code' => '#C62828', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'red:900', 'hex_code' => '#B71C1C', 'created_at' => $now, 'updated_at' => $now],

            // Blue
            ['name' => 'blue:50', 'hex_code' => '#E3F2FD', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'blue:100', 'hex_code' => '#BBDEFB', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'blue:200', 'hex_code' => '#90CAF9', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'blue:300', 'hex_code' => '#64B5F6', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'blue:400', 'hex_code' => '#42A5F5', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'blue:500', 'hex_code' => '#2196F3', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'blue:600', 'hex_code' => '#1E88E5', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'blue:700', 'hex_code' => '#1976D2', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'blue:800', 'hex_code' => '#1565C0', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'blue:900', 'hex_code' => '#0D47A1', 'created_at' => $now, 'updated_at' => $now],

            // Green
            ['name' => 'green:50', 'hex_code' => '#E8F5E9', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'green:100', 'hex_code' => '#C8E6C9', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'green:200', 'hex_code' => '#A5D6A7', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'green:300', 'hex_code' => '#81C784', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'green:400', 'hex_code' => '#66BB6A', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'green:500', 'hex_code' => '#4CAF50', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'green:600', 'hex_code' => '#43A047', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'green:700', 'hex_code' => '#388E3C', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'green:800', 'hex_code' => '#2E7D32', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'green:900', 'hex_code' => '#1B5E20', 'created_at' => $now, 'updated_at' => $now],

            // Yellow
            ['name' => 'yellow:50', 'hex_code' => '#FFFDE7', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'yellow:100', 'hex_code' => '#FFF9C4', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'yellow:200', 'hex_code' => '#FFF59D', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'yellow:300', 'hex_code' => '#FFF176', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'yellow:400', 'hex_code' => '#FFEE58', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'yellow:500', 'hex_code' => '#FFEB3B', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'yellow:600', 'hex_code' => '#FDD835', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'yellow:700', 'hex_code' => '#FBC02D', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'yellow:800', 'hex_code' => '#F9A825', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'yellow:900', 'hex_code' => '#F57F17', 'created_at' => $now, 'updated_at' => $now],

            // Purple
            ['name' => 'purple:50', 'hex_code' => '#F3E5F5', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'purple:100', 'hex_code' => '#E1BEE7', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'purple:200', 'hex_code' => '#CE93D8', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'purple:300', 'hex_code' => '#BA68C8', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'purple:400', 'hex_code' => '#AB47BC', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'purple:500', 'hex_code' => '#9C27B0', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'purple:600', 'hex_code' => '#8E24AA', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'purple:700', 'hex_code' => '#7B1FA2', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'purple:800', 'hex_code' => '#6A1B9A', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'purple:900', 'hex_code' => '#4A148C', 'created_at' => $now, 'updated_at' => $now],

            // Grey
            ['name' => 'grey:50', 'hex_code' => '#FAFAFA', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'grey:100', 'hex_code' => '#F5F5F5', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'grey:200', 'hex_code' => '#EEEEEE', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'grey:300', 'hex_code' => '#E0E0E0', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'grey:400', 'hex_code' => '#BDBDBD', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'grey:500', 'hex_code' => '#9E9E9E', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'grey:600', 'hex_code' => '#757575', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'grey:700', 'hex_code' => '#616161', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'grey:800', 'hex_code' => '#424242', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'grey:900', 'hex_code' => '#212121', 'created_at' => $now, 'updated_at' => $now],

            // Orange
            ['name' => 'orange:50', 'hex_code' => '#FFF3E0', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'orange:100', 'hex_code' => '#FFE0B2', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'orange:200', 'hex_code' => '#FFCC80', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'orange:300', 'hex_code' => '#FFB74D', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'orange:400', 'hex_code' => '#FFA726', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'orange:500', 'hex_code' => '#FF9800', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'orange:600', 'hex_code' => '#FB8C00', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'orange:700', 'hex_code' => '#F57C00', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'orange:800', 'hex_code' => '#EF6C00', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'orange:900', 'hex_code' => '#E65100', 'created_at' => $now, 'updated_at' => $now],

            // Pink
            ['name' => 'pink:50', 'hex_code' => '#FCE4EC', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'pink:100', 'hex_code' => '#F8BBD0', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'pink:200', 'hex_code' => '#F48FB1', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'pink:300', 'hex_code' => '#F06292', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'pink:400', 'hex_code' => '#EC407A', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'pink:500', 'hex_code' => '#E91E63', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'pink:600', 'hex_code' => '#D81B60', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'pink:700', 'hex_code' => '#C2185B', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'pink:800', 'hex_code' => '#AD1457', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'pink:900', 'hex_code' => '#880E4F', 'created_at' => $now, 'updated_at' => $now],

            // Brown
            ['name' => 'brown:50', 'hex_code' => '#EFEBE9', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'brown:100', 'hex_code' => '#D7CCC8', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'brown:200', 'hex_code' => '#BCAAA4', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'brown:300', 'hex_code' => '#A1887F', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'brown:400', 'hex_code' => '#8D6E63', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'brown:500', 'hex_code' => '#795548', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'brown:600', 'hex_code' => '#6D4C41', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'brown:700', 'hex_code' => '#5D4037', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'brown:800', 'hex_code' => '#4E342E', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'brown:900', 'hex_code' => '#3E2723', 'created_at' => $now, 'updated_at' => $now],

            // Cyan
            ['name' => 'cyan:50', 'hex_code' => '#E0F7FA', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'cyan:100', 'hex_code' => '#B2EBF2', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'cyan:200', 'hex_code' => '#80DEEA', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'cyan:300', 'hex_code' => '#4DD0E1', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'cyan:400', 'hex_code' => '#26C6DA', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'cyan:500', 'hex_code' => '#00BCD4', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'cyan:600', 'hex_code' => '#00ACC1', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'cyan:700', 'hex_code' => '#0097A7', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'cyan:800', 'hex_code' => '#00838F', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'cyan:900', 'hex_code' => '#006064', 'created_at' => $now, 'updated_at' => $now],
        ];

        DB::table('colors')->insert($colors);
    }
}
