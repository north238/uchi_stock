<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Icon>
 */
class IconFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word,
            'icon_code' => $this->generateIconCode()
        ];
    }

    private function generateIconCode()
    {
        // ランダムなアイコン名のリストを用意
        $iconNames = [
            'fa-user',
            'fa-camera',
            'fa-home',
            'fa-heart',
            'fa-cog',
        ];

        // ランダムにアイコン名を選択し、Font Awesomeのクラス形式にする
        $randomIcon = $this->faker->randomElement($iconNames);
        return "fa-solid {$randomIcon}";
    }
}
