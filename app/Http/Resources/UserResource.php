<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => trim($this->first_name . ' ' . $this->last_name),
            'email' => $this->email,
            'phone' => $this->phone_number ?? '',
            'role' => 'admin',
            'is_admin' => true,
        ];
    }
}
