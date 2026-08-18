<?php

namespace App\Http\Requests\Game;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $game = $this->route('game');

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('games', 'slug')->ignore($game?->id),
            ],
            'description' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'genre' => ['sometimes', 'nullable', 'string', 'max:100'],
            'developer' => ['sometimes', 'nullable', 'string', 'max:255'],
            'publisher' => ['sometimes', 'nullable', 'string', 'max:255'],
            'release_date' => ['sometimes', 'nullable', 'date'],
            'cover_image' => ['sometimes', 'nullable', 'url:http,https', 'max:2048'],
            'background_image' => ['sometimes', 'nullable', 'url:http,https', 'max:2048'],
            'platforms' => ['sometimes', 'nullable', 'array', 'max:20'],
            'platforms.*' => ['string', 'max:50', 'distinct'],
            'color' => ['sometimes', 'nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'initials' => ['sometimes', 'nullable', 'string', 'max:8'],
        ];
    }
}
