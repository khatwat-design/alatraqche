<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'notes' => $this->notes,
            'orders_count' => (int) ($this->orders_count ?? $this->orders()->count()),
            'total_spent' => (float) ($this->total_spent ?? $this->orders()->where('status', '!=', 'cancelled')->sum('total')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];

        if ($this->relationLoaded('recentOrders')) {
            $data['recent_orders'] = OrderResource::collection($this->recentOrders);
        }

        return $data;
    }
}
