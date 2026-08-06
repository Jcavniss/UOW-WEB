<?php

namespace App\Http\Requests\Game;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'search' => ['sometimes', 'string', 'max:100'],
            'genre' => ['sometimes', 'string', 'max:100'],
            'platform' => ['sometimes', 'string', 'max:50'],
            'release_date' => ['sometimes', 'date'],
            'released_from' => ['sometimes', 'date'],
            'released_to' => ['sometimes', 'date', 'after_or_equal:released_from'],
            'release_status' => ['sometimes', Rule::in(['released', 'upcoming'])],
            'sort' => ['sometimes', Rule::in([
                'title',
                'release_date',
                'average_rating',
                'ratings_count',
                'created_at',
            ])],
            'order' => ['sometimes', Rule::in(['asc', 'desc'])],
        ];
    }
}
