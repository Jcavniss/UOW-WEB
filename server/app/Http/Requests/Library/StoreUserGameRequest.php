<?php

namespace App\Http\Requests\Library;

use App\Models\UserGame;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'game_id' => ['required', 'integer', 'exists:games,id'],
            'status' => ['required', Rule::in(UserGame::STATUSES)],
            'personal_notes' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
