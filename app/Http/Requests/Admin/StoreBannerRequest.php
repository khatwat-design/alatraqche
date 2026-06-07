<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'link_url' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'عنوان البانر مطلوب.',
            'image.image' => 'يجب أن يكون الملف صورة.',
            'image.max' => 'حجم الصورة يجب أن لا يتجاوز 2 ميجابايت.',
        ];
    }
}
