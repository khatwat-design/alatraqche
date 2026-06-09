<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) ($this->user()?->is_admin);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_enabled' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'id' => ['nullable', 'string', 'max:255', 'unique:categories,id'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم التصنيف مطلوب.',
            'name.max' => 'اسم التصنيف يجب ألا يتجاوز 255 حرفاً.',
            'description.max' => 'الوصف يجب ألا يتجاوز 1000 حرف.',
            'id.unique' => 'المعرف موجود مسبقاً.',
        ];
    }
}
