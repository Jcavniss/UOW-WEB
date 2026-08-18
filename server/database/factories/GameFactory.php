<?php

namespace Database\Factories;

use App\Models\Game;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Game> */
class GameFactory extends Factory
{
    protected $model = Game::class;

    public function definition(): array
    {
        $title = fake()->unique()->words(3, true);

        return [
            'title' => Str::title($title),
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1, 999999),
            'description' => fake()->paragraph(),
            'genre' => fake()->randomElement(['RPG', 'Action RPG', 'Simulation', 'Metroidvania']),
            'developer' => fake()->company(),
            'publisher' => fake()->company(),
            'release_date' => fake()->dateTimeBetween('-5 years', '+2 years'),
            'platforms' => fake()->randomElements(['PC', 'PS5', 'Xbox', 'Switch'], 2),
            'color' => fake()->hexColor(),
            'initials' => Str::upper(Str::substr(preg_replace('/[^A-Za-z]/', '', $title), 0, 2)),
        ];
    }
}
