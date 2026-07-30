<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $group = Group::firstOrCreate(
            ['name' => '開発用グループ'],
            ['description' => 'ローカル開発用のテストグループ']
        );

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'test',
                'password' => 'password',
                'group_id' => $group->id,
                'email_verified_at' => now(),
            ]
        );
    }
}
