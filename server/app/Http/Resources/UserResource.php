<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'avatar' => $this->avatarUrl(),
            'avatar_color' => $this->avatar_color,
            'bio' => $this->bio,
            'favorite_genre' => $this->favorite_genre,
            'favorite_game_id' => $this->favorite_game_id,
            'favorite_game' => $this->whenLoaded('favoriteGame', fn () => [
                'id' => $this->favoriteGame?->id,
                'title' => $this->favoriteGame?->title,
                'slug' => $this->favoriteGame?->slug,
                'genre' => $this->favoriteGame?->genre,
                'color' => $this->favoriteGame?->color,
                'initials' => $this->favoriteGame?->initials,
            ]),
            'role' => $this->role,
            'joined_year' => $this->created_at?->year,
            'statistics' => [
                'library_count' => (int) ($this->library_count ?? 0),
                'games_played' => (int) ($this->games_played ?? 0),
                'ratings_count' => (int) ($this->ratings_count ?? 0),
                'hours_logged' => 0,
            ],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function avatarUrl(): ?string
    {
        if (! $this->avatar) {
            return null;
        }

        if (str_starts_with($this->avatar, 'http://') || str_starts_with($this->avatar, 'https://')) {
            return $this->avatar;
        }

        return asset('storage/'.$this->avatar);
    }
}
