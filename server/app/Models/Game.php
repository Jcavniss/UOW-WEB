<?php

namespace App\Models;

use Database\Factories\GameFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Game extends Model
{
    /** @use HasFactory<GameFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'genre',
        'developer',
        'publisher',
        'release_date',
        'cover_image',
        'background_image',
        'platforms',
        'color',
        'initials',
    ];

    protected function casts(): array
    {
        return [
            'release_date' => 'date',
            'platforms' => 'array',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function userGames(): HasMany
    {
        return $this->hasMany(UserGame::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_games')
            ->withPivot(['id', 'status', 'personal_notes'])
            ->withTimestamps();
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function favoritedBy(): HasMany
    {
        return $this->hasMany(User::class, 'favorite_game_id');
    }
}
