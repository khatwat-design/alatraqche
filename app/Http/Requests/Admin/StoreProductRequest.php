<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'stock' => 'nullable|integer|min:0',
            'category_id' => 'nullable|string|exists:categories,id',
            'badge' => 'nullable|string|max:64',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
            'primary_image' => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم المنتج مطلوب.',
            'price.required' => 'السعر مطلوب.',
            'price.integer' => 'السعر يجب أن يكون رقماً صحيحاً.',
            'category_id.exists' => 'التصنيف المحدد غير موجود.',
        ];
    }
}
