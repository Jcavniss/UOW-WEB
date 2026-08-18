<?php

namespace App\Http\Requests\Game;

use Illuminate\Foundation\Http\FormRequest;

class StoreGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', 'unique:games,slug'],
            'description' => ['nullable', 'string', 'max:10000'],
            'genre' => ['nullable', 'string', 'max:100'],
            'developer' => ['nullable', 'string', 'max:255'],
            'publisher' => ['nullable', 'string', 'max:255'],
            'release_date' => ['nullable', 'date'],
            'cover_image' => ['nullable', 'url:http,https', 'max:2048'],
            'background_image' => ['nullable', 'url:http,https', 'max:2048'],
            'platforms' => ['nullable', 'array', 'max:20'],
            'platforms.*' => ['string', 'max:50', 'distinct'],
            'color' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'initials' => ['nullable', 'string', 'max:8'],
        ];
    }
}
