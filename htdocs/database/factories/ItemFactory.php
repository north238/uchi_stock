<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Item>
 */
class ItemFactory extends Factory
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
            'user_id' => \App\Models\User::factory(),
            'genre_id' => \App\Models\Genre::factory(),
            'category_id' => \App\Models\Category::factory(),
            'location_id' => \App\Models\Location::factory(),
            'quantity' => $this->faker->numberBetween(1, 100),
            'is_favorite' => $this->faker->boolean,
            'description' => $this->faker->sentence,
        ];
    }
}
