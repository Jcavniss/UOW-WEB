<?php

namespace Tests\Feature;

use App\Models\Game;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogStageTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_and_game_details_are_available(): void
    {
        $game = Game::factory()->create(['title' => 'Elden Ring', 'slug' => 'elden-ring']);

        $this->getJson('/api/games')->assertOk()->assertJsonPath('data.0.slug', 'elden-ring');
        $this->getJson('/api/games/'.$game->slug)->assertOk()->assertJsonPath('data.title', 'Elden Ring');
    }

    public function test_random_and_upcoming_endpoints_are_available(): void
    {
        Game::factory()->create(['release_date' => now()->addMonth()]);

        $this->getJson('/api/games/random')->assertOk();
        $this->getJson('/api/games/upcoming')->assertOk()->assertJsonCount(1, 'data');
    }
}
