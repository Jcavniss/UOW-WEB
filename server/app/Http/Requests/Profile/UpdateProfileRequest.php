<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => [
                'sometimes',
                'required',
                'string',
                'min:3',
                'max:30',
                'alpha_dash',
                Rule::unique('users', 'username')->ignore($this->user()->id),
            ],
            'date_of_birth' => ['sometimes', 'nullable', 'date', 'before_or_equal:today'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'avatar' => ['sometimes', 'nullable', 'string', 'max:3000000'],
            'avatar_color' => ['sometimes', 'required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'favorite_genre' => ['sometimes', 'nullable', 'string', 'max:100'],
            'favorite_game_id' => ['sometimes', 'nullable', 'integer', 'exists:games,id'],
            'password' => ['sometimes', 'nullable', 'confirmed', Password::min(8)],
        ];
    }
}
