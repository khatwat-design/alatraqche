<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|integer|min:0',
            'stock' => 'nullable|integer|min:0',
            'category_id' => 'nullable|string|exists:categories,id',
            'badge' => 'nullable|string|max:64',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.exists' => 'التصنيف المحدد غير موجود.',
        ];
    }
}
