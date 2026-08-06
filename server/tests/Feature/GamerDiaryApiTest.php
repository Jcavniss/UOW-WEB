<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Rating;
use App\Models\User;
use App\Models\UserGame;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GamerDiaryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receives_token(): void
    {
        $response = $this->postJson('/api/register', [
            'username' => 'NewPlayer',
            'email' => 'new@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'date_of_birth' => '2000-01-01',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.user.username', 'NewPlayer')
            ->assertJsonStructure(['data' => ['user', 'token'], 'message']);

        $this->assertDatabaseHas('users', [
            'username' => 'NewPlayer',
            'email' => 'new@example.com',
            'role' => 'user',
        ]);
        $this->assertTrue(Hash::check('password', User::firstWhere('email', 'new@example.com')->password));
    }

    public function test_registration_rejects_existing_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/register', [
            'username' => 'AnotherPlayer',
            'email' => 'taken@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_user_can_login(): void
    {
        User::factory()->create([
            'email' => 'player@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->postJson('/api/login', [
            'email' => 'player@example.com',
            'password' => 'password',
        ])->assertOk()->assertJsonStructure(['data' => ['user', 'token']]);
    }

    public function test_login_rejects_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'player@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->postJson('/api/login', [
            'email' => 'player@example.com',
            'password' => 'wrong-password',
        ])->assertUnauthorized()->assertJsonPath('message', 'Invalid email or password');
    }

    public function test_logout_revokes_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $headers = ['Authorization' => 'Bearer '.$token];

        $this->postJson('/api/logout', [], $headers)->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/user', $headers)->assertUnauthorized();
    }

    public function test_authenticated_user_can_be_retrieved(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonMissingPath('data.password');
    }

    public function test_games_are_paginated_and_searchable(): void
    {
        Game::factory()->count(14)->create();
        Game::factory()->create(['title' => 'The Witcher 3', 'slug' => 'the-witcher-3']);

        $response = $this->getJson('/api/games?search=witcher&per_page=5');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'The Witcher 3')
            ->assertJsonStructure(['data', 'links', 'meta', 'message']);
    }

    public function test_admin_can_create_game(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $this->postJson('/api/games', [
            'title' => 'Admin Created Game',
            'genre' => 'RPG',
            'platforms' => ['PC'],
        ])->assertCreated()->assertJsonPath('data.slug', 'admin-created-game');

        $this->assertDatabaseHas('games', ['slug' => 'admin-created-game']);
    }

    public function test_regular_user_cannot_create_game(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'user']));

        $this->postJson('/api/games', [
            'title' => 'Forbidden Game',
        ])->assertForbidden();
    }

    public function test_user_can_add_game_to_library(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/library', [
            'game_id' => $game->id,
            'status' => 'planned',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'planned')
            ->assertJsonPath('data.game.id', $game->id);
    }

    public function test_library_rejects_duplicate_game(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create();
        $user->userGames()->create(['game_id' => $game->id, 'status' => 'planned']);
        Sanctum::actingAs($user);

        $this->postJson('/api/library', [
            'game_id' => $game->id,
            'status' => 'playing',
        ])->assertStatus(409);
    }

    public function test_user_can_update_own_library_status(): void
    {
        $user = User::factory()->create();
        $entry = $user->userGames()->create([
            'game_id' => Game::factory()->create()->id,
            'status' => 'planned',
        ]);
        Sanctum::actingAs($user);

        $this->patchJson('/api/library/'.$entry->id, [
            'status' => 'playing',
        ])->assertOk()->assertJsonPath('data.status', 'playing');
    }

    public function test_user_cannot_update_another_users_library(): void
    {
        $owner = User::factory()->create();
        $entry = $owner->userGames()->create([
            'game_id' => Game::factory()->create()->id,
            'status' => 'planned',
        ]);
        Sanctum::actingAs(User::factory()->create());

        $this->patchJson('/api/library/'.$entry->id, [
            'status' => 'completed',
        ])->assertForbidden();
    }

    public function test_user_can_create_rating(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson("/api/games/{$game->slug}/ratings", [
            'score' => 9,
            'review' => 'Great game.',
        ])->assertCreated()->assertJsonPath('data.score', 9);
    }

    public function test_rating_score_must_be_between_one_and_ten(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson("/api/games/{$game->slug}/ratings", [
            'score' => 11,
        ])->assertUnprocessable()->assertJsonValidationErrors('score');
    }

    public function test_user_cannot_update_another_users_rating(): void
    {
        $owner = User::factory()->create();
        $game = Game::factory()->create();
        $rating = Rating::forceCreate([
            'user_id' => $owner->id,
            'game_id' => $game->id,
            'score' => 8,
        ]);
        Sanctum::actingAs(User::factory()->create());

        $this->patchJson("/api/games/{$game->slug}/ratings/{$rating->id}", [
            'score' => 10,
        ])->assertForbidden();
    }

    public function test_user_can_delete_own_rating(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create();
        $rating = Rating::forceCreate([
            'user_id' => $user->id,
            'game_id' => $game->id,
            'score' => 8,
        ]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/games/{$game->slug}/ratings/{$rating->id}")
            ->assertNoContent();
        $this->assertDatabaseMissing('ratings', ['id' => $rating->id]);
    }

    public function test_game_response_contains_aggregates_and_current_user_data(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $game = Game::factory()->create();
        $entry = UserGame::forceCreate([
            'user_id' => $user->id,
            'game_id' => $game->id,
            'status' => 'playing',
        ]);
        Rating::forceCreate(['user_id' => $user->id, 'game_id' => $game->id, 'score' => 8]);
        Rating::forceCreate(['user_id' => $other->id, 'game_id' => $game->id, 'score' => 10]);
        Sanctum::actingAs($user);

        $this->getJson('/api/games/'.$game->slug)
            ->assertOk()
            ->assertJsonPath('data.average_rating', 9)
            ->assertJsonPath('data.ratings_count', 2)
            ->assertJsonPath('data.library_entry.id', $entry->id)
            ->assertJsonPath('data.current_user_rating.score', 8);
    }

    public function test_random_game_endpoint_returns_a_game(): void
    {
        Game::factory()->count(3)->create();

        $this->getJson('/api/games/random')
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'title', 'slug']]);
    }

    public function test_random_library_game_respects_status_filter(): void
    {
        $user = User::factory()->create();
        $planned = Game::factory()->create();
        $completed = Game::factory()->create();
        $user->userGames()->create(['game_id' => $planned->id, 'status' => 'planned']);
        $user->userGames()->create(['game_id' => $completed->id, 'status' => 'completed']);
        Sanctum::actingAs($user);

        $this->getJson('/api/games/random?source=library&status=planned')
            ->assertOk()
            ->assertJsonPath('data.id', $planned->id);
    }

    public function test_upcoming_releases_only_return_future_games(): void
    {
        Game::factory()->create(['release_date' => now()->subDay()]);
        $future = Game::factory()->create(['release_date' => now()->addMonth()]);

        $this->getJson('/api/games/upcoming?limit=10')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $future->id);
    }

    public function test_profile_favorite_game_must_belong_to_user_library(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create();
        Sanctum::actingAs($user);

        $this->putJson('/api/user/profile', [
            'favorite_game_id' => $game->id,
        ])->assertUnprocessable()->assertJsonValidationErrors('favorite_game_id');

        $user->userGames()->create(['game_id' => $game->id, 'status' => 'planned']);

        $this->putJson('/api/user/profile', [
            'favorite_game_id' => $game->id,
            'favorite_genre' => 'RPG',
        ])->assertOk()
            ->assertJsonPath('data.favorite_game_id', $game->id)
            ->assertJsonPath('data.favorite_genre', 'RPG');
    }
}
