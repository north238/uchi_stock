<?php

namespace Database\Factories;

use App\Enums\ItemStatus;
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
            'name' => fake()->word(),
            'status' => fake()->randomElement(ItemStatus::values()),
            'quantity' => fake()->optional()->numberBetween(0, 10),
            'group_id' => null,
            'created_by' => null,
        ];
    }
}
