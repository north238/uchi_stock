<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GroupSendMailRequest extends FormRequest
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
            'email' => 'required|email|exists:users,email',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'email' => 'メールアドレス',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'email.required' => ':attributeは必須です。',
            'email.email' => ':attributeの形式が正しくありません。',
            'email.exists' => ':attributeが存在しません。',
        ];
    }
}
