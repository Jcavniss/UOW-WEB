<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'email',
        'password',
        'date_of_birth',
        'avatar',
        'avatar_color',
        'bio',
        'favorite_genre',
        'favorite_game_id',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'date_of_birth' => 'date',
            'password' => 'hashed',
        ];
    }

    public function userGames(): HasMany
    {
        return $this->hasMany(UserGame::class);
    }

    public function games(): BelongsToMany
    {
        return $this->belongsToMany(Game::class, 'user_games')
            ->withPivot(['id', 'status', 'personal_notes'])
            ->withTimestamps();
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function favoriteGame(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'favorite_game_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
