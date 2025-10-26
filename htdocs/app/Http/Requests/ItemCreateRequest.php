<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ItemCreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'memo' => 'nullable|string|max:255',
            'genre_id' => 'nullable|integer|exists:genres,id',
            'place_id' => 'nullable|integer|exists:places,id',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => '品名',
            'quantity' => '数量',
            'memo' => 'メモ',
            'genre_id' => 'ジャンル',
            'place_id' => '保管場所',
        ];
    }
}
