<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => (float) $this->price,
            'stock' => $this->stock_qty,
            'badge' => $this->badge,
            'category_id' => $this->category_id,
            'category' => $this->category?->name ?? '',
            'is_active' => (bool) $this->is_visible,
            'sort_order' => $this->sort_order,
            'image' => $this->image_public_url,
            'images' => $this->gallery_urls,
            'options' => ProductOptionResource::collection($this->whenLoaded('options')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
