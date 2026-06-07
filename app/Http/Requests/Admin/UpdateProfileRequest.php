<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,'.$userId,
            'phone' => 'sometimes|string|max:32',
            'password' => 'sometimes|string|min:8|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'البريد الإلكتروني مستخدم مسبقاً.',
            'password.min' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق.',
        ];
    }
}
