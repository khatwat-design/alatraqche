<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'invoice_id' => $this->invoice_id,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'customer_city' => $this->customer_city,
            'customer_address' => $this->customer_address,
            'total' => (float) $this->total,
            'subtotal' => (float) $this->subtotal,
            'delivery_fee' => (float) $this->delivery_fee,
            'discount' => (float) $this->discount,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_method === 'cod' ? 'unpaid' : 'paid',
            'notes' => $this->notes,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];

        if ($this->relationLoaded('customer')) {
            $data['customer'] = new CustomerResource($this->customer);
        }

        return $data;
    }
}
