<?php

namespace App\Http\Requests\Rating;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'score' => ['sometimes', 'required', 'integer', 'between:1,10'],
            'review' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ];
    }
}
