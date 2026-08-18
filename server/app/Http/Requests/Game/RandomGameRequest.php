<?php

namespace App\Http\Requests\Game;

use App\Models\UserGame;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RandomGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'source' => ['sometimes', Rule::in(['catalog', 'library'])],
            'status' => ['sometimes', Rule::in(UserGame::STATUSES)],
            'genre' => ['sometimes', 'string', 'max:100'],
        ];
    }
}
