<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RatingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'game_id' => $this->game_id,
            'score' => $this->score,
            'review' => $this->review,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'username' => $this->user->username,
                'avatar' => $this->user->avatar,
                'avatar_color' => $this->user->avatar_color,
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
