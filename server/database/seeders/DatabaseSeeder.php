<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Rating;
use App\Models\User;
use App\Models\UserGame;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            GameSeeder::class,
            UserSeeder::class,
        ]);

        $admin = User::where('email', 'admin@example.com')->firstOrFail();
        $player = User::where('email', 'player@example.com')->firstOrFail();
        $demo = User::where('email', 'demo@example.com')->firstOrFail();

        $eldenRing = Game::where('slug', 'elden-ring')->firstOrFail();
        $baldursGate = Game::where('slug', 'baldurs-gate-3')->firstOrFail();
        $hades = Game::where('slug', 'hades')->firstOrFail();
        $stardew = Game::where('slug', 'stardew-valley')->firstOrFail();
        $witcher = Game::where('slug', 'the-witcher-3')->firstOrFail();

        $libraryRows = [
            [$admin, $eldenRing, 'completed', 'A benchmark for open-world exploration.'],
            [$admin, $baldursGate, 'playing', null],
            [$player, $eldenRing, 'completed', 'Finished twice.'],
            [$player, $hades, 'playing', 'Working through the epilogue.'],
            [$player, $stardew, 'on_hold', null],
            [$player, $witcher, 'planned', null],
            [$demo, $hades, 'completed', null],
            [$demo, $baldursGate, 'planned', null],
        ];

        foreach ($libraryRows as [$user, $game, $status, $notes]) {
            UserGame::create([
                'user_id' => $user->id,
                'game_id' => $game->id,
                'status' => $status,
                'personal_notes' => $notes,
            ]);
        }

        $ratings = [
            [$admin, $eldenRing, 10, 'An unforgettable adventure.'],
            [$player, $eldenRing, 9, 'Demanding, but consistently rewarding.'],
            [$player, $hades, 10, 'Superb action and storytelling.'],
            [$demo, $hades, 9, 'A brilliant run-based game.'],
            [$demo, $baldursGate, 10, 'Remarkable freedom and characters.'],
        ];

        foreach ($ratings as [$user, $game, $score, $review]) {
            Rating::create([
                'user_id' => $user->id,
                'game_id' => $game->id,
                'score' => $score,
                'review' => $review,
            ]);
        }

        $player->update([
            'favorite_game_id' => $eldenRing->id,
            'favorite_genre' => 'Action RPG',
        ]);
    }
}
