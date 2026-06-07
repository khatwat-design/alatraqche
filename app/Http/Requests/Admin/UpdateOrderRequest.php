<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        return [
            'status' => 'required|string|in:pending,confirmed,processing,shipped,delivered,cancelled',
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'حالة الطلب مطلوبة.',
            'status.in' => 'حالة الطلب غير صالحة.',
        ];
    }
}
