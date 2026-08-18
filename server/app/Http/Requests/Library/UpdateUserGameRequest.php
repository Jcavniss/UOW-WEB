<?php

namespace App\Http\Requests\Library;

use App\Models\UserGame;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'required', Rule::in(UserGame::STATUSES)],
            'personal_notes' => ['sometimes', 'nullable', 'string', 'max:10000'],
        ];
    }
}
