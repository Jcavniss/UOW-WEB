<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserGame extends Model
{
    use HasFactory;

    public const STATUSES = [
        'playing',
        'completed',
        'planned',
        'dropped',
        'on_hold',
    ];

    protected $fillable = [
        'game_id',
        'status',
        'personal_notes',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
