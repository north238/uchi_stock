<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ItemRequest extends FormRequest
{
  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
   */
  public function rules(): array
  {
    return [
      'name' => ['required', 'string', 'max:255'],
      'description' => ['nullable', 'string', 'max:255'],
      'quantity' => ['required', 'integer'],
      'genre_id' => ['required', 'exists:genres,id'],
      'category_id' => ['required', 'exists:categories,id'],
      'location_id' => ['required', 'exists:locations,id'],
    ];
  }
}
