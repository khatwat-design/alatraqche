<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBannerRequest;
use App\Http\Requests\Admin\UpdateBannerRequest;
use App\Http\Resources\BannerCollection;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBannerController extends Controller
{
    public function index(Request $request): BannerCollection
    {
        $perPage = min((int) $request->query('per_page', 50), 100);

        $banners = Banner::query()
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return new BannerCollection($banners);
    }

    public function show(string $id): BannerResource|JsonResponse
    {
        $banner = Banner::query()->whereKey($id)->first();

        if (! $banner) {
            return response()->json(['message' => 'البانر غير موجود.'], 404);
        }

        return new BannerResource($banner);
    }

    public function store(StoreBannerRequest $request): JsonResponse
    {
        $data = $request->validated();

        $maxSort = Banner::max('sort_order') ?? 0;

        $banner = new Banner();
        $banner->title = $data['title'];
        $banner->link_url = $data['link_url'] ?? null;
        $banner->sort_order = $maxSort + 1;
        $banner->is_active = $data['is_active'] ?? true;
        $banner->image = '';

        if ($request->hasFile('image')) {
            $banner->addMediaFromRequest('image')
                ->toMediaCollection('default');
        }

        $banner->save();

        return response()->json([
            'ok' => true,
            'banner' => new BannerResource($banner),
        ], 201);
    }

    public function update(UpdateBannerRequest $request, string $id): JsonResponse
    {
        $banner = Banner::query()->whereKey($id)->first();

        if (! $banner) {
            return response()->json(['message' => 'البانر غير موجود.'], 404);
        }

        $data = $request->validated();

        if (isset($data['title'])) {
            $banner->title = $data['title'];
        }
        if (array_key_exists('link_url', $data)) {
            $banner->link_url = $data['link_url'];
        }
        if (isset($data['sort_order'])) {
            $banner->sort_order = (int) $data['sort_order'];
        }
        if (isset($data['is_active'])) {
            $banner->is_active = (bool) $data['is_active'];
        }

        if ($request->hasFile('image')) {
            $banner->clearMediaCollection('default');
            $banner->addMediaFromRequest('image')
                ->toMediaCollection('default');
        }

        $banner->save();

        return response()->json([
            'ok' => true,
            'message' => 'تم تحديث البانر بنجاح',
            'banner' => new BannerResource($banner),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $banner = Banner::query()->whereKey($id)->first();

        if (! $banner) {
            return response()->json(['message' => 'البانر غير موجود.'], 404);
        }

        $banner->clearMediaCollection('default');
        $banner->delete();

        return response()->json([
            'ok' => true,
            'message' => 'تم حذف البانر بنجاح',
        ]);
    }
}
