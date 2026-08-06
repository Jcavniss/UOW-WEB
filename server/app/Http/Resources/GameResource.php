<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user('sanctum');
        $libraryEntry = $user && $this->resource->relationLoaded('userGames')
            ? $this->userGames->firstWhere('user_id', $user->id)
            : null;
        $currentRating = $user && $this->resource->relationLoaded('ratings')
            ? $this->ratings->firstWhere('user_id', $user->id)
            : null;
        $averageRating = $this->ratings_avg_score;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'genre' => $this->genre,
            'developer' => $this->developer,
            'publisher' => $this->publisher,
            'release_date' => $this->release_date?->toDateString(),
            'cover_image' => $this->cover_image,
            'background_image' => $this->background_image,
            'platforms' => $this->platforms ?? [],
            'color' => $this->color,
            'initials' => $this->initials,
            'average_rating' => $averageRating === null ? null : round((float) $averageRating, 2),
            'ratings_count' => (int) ($this->ratings_count ?? 0),
            'library_entry' => $libraryEntry ? [
                'id' => $libraryEntry->id,
                'status' => $libraryEntry->status,
                'personal_notes' => $libraryEntry->personal_notes,
            ] : null,
            'current_user_rating' => $currentRating ? [
                'id' => $currentRating->id,
                'score' => $currentRating->score,
                'review' => $currentRating->review,
            ] : null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
