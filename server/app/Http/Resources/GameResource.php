<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameResource extends JsonResource
{
    public function toArray(Request $request): array
    {
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
            'average_rating' => null,
            'ratings_count' => 0,
            'library_entry' => null,
            'current_user_rating' => null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
