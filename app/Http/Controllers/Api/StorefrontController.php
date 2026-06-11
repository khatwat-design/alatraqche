<?php

namespace App\Http\Controllers\Api;

use App\Helpers\AssetHelper;
use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use App\Models\StoreSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class StorefrontController extends Controller
{
    public function store(): JsonResponse
    {
        $s = StoreSetting::current();

        return response()->json([
            'storeName' => $s->store_name,
            'sloganLine1' => $s->slogan_line1,
            'sloganLine2' => $s->slogan_line2,
            'sloganHighlightPhrase' => $s->slogan_highlight_phrase,
            'metaTitle' => $s->meta_title,
            'headerBackground' => $s->header_background,
            'footerBackground' => $s->footer_background,
            'primaryColor' => $s->primary_color,
            'logoUrl' => $s->logo_url,
            'addressLine' => $s->address_line,
            'mapLat' => $s->map_lat,
            'mapLng' => $s->map_lng,
            'mapEmbedUrl' => $s->map_embed_url,
            'phones' => array_values(array_filter([
                $s->phone_primary,
                $s->phone_secondary,
            ])),
            'instagramUrl' => $s->instagram_url,
            'facebookUrl' => $s->facebook_url,
            'tiktokUrl' => $s->tiktok_url,
            'metaPixelId' => $s->meta_pixel_id,
            'tiktokPixelId' => $s->tiktok_pixel_id,
            'googleAnalyticsId' => $s->google_analytics_id,
            'snapchatPixelId' => $s->snapchat_pixel_id,
            'twitterPixelId' => $s->twitter_pixel_id,
            'customHeadSnippet' => $s->custom_head_snippet,
        ]);
    }

    public function categories(): JsonResponse
    {
        $rows = Category::query()->orderBy('sort_order')->get();

        return response()->json(
            $rows->map(fn (Category $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'description' => $c->description,
                'image' => AssetHelper::publicUrl($c->image),
            ])->values()->all()
        );
    }

    public function product(string $id): JsonResponse
    {
        $p = Product::query()
            ->with('category')
            ->where('is_visible', true)
            ->whereKey($id)
            ->first();

        if (! $p) {
            return response()->json(['message' => 'غير موجود.'], 404);
        }

        return response()->json(['product' => $p->toStorefrontArray()]);
    }

    public function products(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 50), 100);
        $search = $request->query('search');

        $query = Product::query()
            ->with('category')
            ->where('is_visible', true);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->query('category')) {
            $query->where('category_id', $categoryId);
        }

        $rows = $query->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($perPage);

        return response()->json([
            'products' => collect($rows->items())->map(fn (Product $p) => $p->toStorefrontArray())->values()->all(),
            'meta' => [
                'current_page' => $rows->currentPage(),
                'last_page' => $rows->lastPage(),
                'per_page' => $rows->perPage(),
                'total' => $rows->total(),
            ],
        ]);
    }

    public function banners(): JsonResponse
    {
        $rows = Banner::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->filter(fn (Banner $b) => $b->image_public_url !== '');

        return response()->json(
            $rows->values()->map(fn (Banner $b) => [
                'id' => $b->id,
                'title' => $b->title,
                'image' => $b->image_public_url,
                'linkUrl' => $b->link_url,
            ])->values()->all()
        );
    }
}
