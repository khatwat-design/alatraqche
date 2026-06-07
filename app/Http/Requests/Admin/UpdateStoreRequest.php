<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        return [
            'store_name' => 'nullable|string|max:255',
            'store_description' => 'nullable|string',
            'store_phone' => 'nullable|string|max:32',
            'store_email' => 'nullable|email|max:255',
            'store_address' => 'nullable|string|max:500',
            'delivery_fee' => 'nullable|integer|min:0',
            'free_delivery_threshold' => 'nullable|integer|min:0',
            'currency' => 'nullable|string|max:10',
            'slogan_line1' => 'nullable|string|max:255',
            'slogan_highlight_phrase' => 'nullable|string|max:255',
            'instagram_url' => 'nullable|string|max:500',
            'facebook_url' => 'nullable|string|max:500',
            'tiktok_url' => 'nullable|string|max:500',
        ];
    }
}
