<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:32|unique:customers,phone,'.$id,
            'email' => 'nullable|email|max:255|unique:customers,email,'.$id,
            'notes' => 'nullable|string|max:2000',
        ];
    }

    public function messages(): array
    {
        return [
            'phone.unique' => 'رقم الهاتف موجود مسبقاً.',
        ];
    }
}
