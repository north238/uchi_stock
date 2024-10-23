<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'genre_id' => \App\Models\Item::factory(),
            'message' => $this->faker->sentence,
            'is_read' => $this->faker->boolean,
            'status' => $this->faker->randomElement(['pending', 'sent', 'failed']),
            'sent_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
