<?php

namespace App\Models;

use Database\Factories\GameFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    /** @use HasFactory<GameFactory> */
    use HasFactory;

    protected $fillable = [
        'title', 'slug', 'description', 'genre', 'developer', 'publisher',
        'release_date', 'cover_image', 'background_image', 'platforms', 'color', 'initials',
    ];

    protected function casts(): array
    {
        return ['release_date' => 'date', 'platforms' => 'array'];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
