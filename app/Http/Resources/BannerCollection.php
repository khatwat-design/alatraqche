<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class BannerCollection extends ResourceCollection
{
    public $collects = BannerResource::class;

    public function toArray(Request $request): array
    {
        return [
            'banners' => $this->collection,
            'meta' => [
                'current_page' => $this->resource->currentPage(),
                'last_page' => $this->resource->lastPage(),
                'per_page' => $this->resource->perPage(),
                'total' => $this->resource->total(),
            ],
        ];
    }

    public function paginationInformation(Request $request, array $paginated, array $default): array
    {
        return [];
    }
}
