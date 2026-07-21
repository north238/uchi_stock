<?php

namespace App\Http\Requests;

use App\Enums\ItemStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ItemUpdateRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'status' => ['nullable', Rule::enum(ItemStatus::class)],
            'quantity' => ['nullable', 'integer', 'min:0'],
            'genre_id' => ['nullable', 'integer', 'exists:genres,id'],
            'place_id' => ['nullable', 'integer', 'exists:places,id'],
            'memo' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => '品名',
            'status' => 'ステータス',
            'quantity' => '数量',
            'memo' => 'メモ',
            'genre_id' => 'ジャンル',
            'place_id' => '保管場所',
        ];
    }
}
