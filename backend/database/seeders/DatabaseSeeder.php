<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            LocationSeeder::class,
            ColorSeeder::class,
            GenreSeeder::class,
            GroupSeeder::class,
            ItemSeeder::class,
            NotificationSeeder::class,
            UserGroupSeeder::class,
            ItemTagSeeder::class,
            GroupItemSeeder::class
        ]);
    }
}
