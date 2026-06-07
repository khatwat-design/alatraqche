<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:32|unique:customers,phone',
            'email' => 'nullable|email|max:255|unique:customers,email',
            'notes' => 'nullable|string|max:2000',
            'password' => 'nullable|string|min:6',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم العميل مطلوب.',
            'phone.required' => 'رقم الهاتف مطلوب.',
            'phone.unique' => 'رقم الهاتف موجود مسبقاً.',
        ];
    }
}
