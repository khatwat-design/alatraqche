<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateStoreRequest;
use App\Models\StoreSetting;
use App\Services\Admin\AdminDashboardService;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    public function __construct(
        private readonly AdminDashboardService $dashboardService
    ) {}

    public function dashboard(): JsonResponse
    {
        return response()->json(
            $this->dashboardService->getDashboardStats()
        );
    }

    public function analytics(): JsonResponse
    {
        return response()->json(
            $this->dashboardService->getAnalytics()
        );
    }

    public function getStore(): JsonResponse
    {
        $s = StoreSetting::current();

        return response()->json([
            'store_name' => $s->store_name,
            'store_description' => $s->slogan_line2,
            'store_phone' => $s->phone_primary,
            'store_email' => $s->meta_title,
            'store_address' => $s->address_line,
            'delivery_fee' => (int) ($s->delivery_fee ?? 0),
            'free_delivery_threshold' => (int) ($s->free_delivery_threshold ?? 0),
            'currency' => 'IQD',
            'slogan_line1' => $s->slogan_line1,
            'slogan_highlight_phrase' => $s->slogan_highlight_phrase,
            'instagram_url' => $s->instagram_url,
            'facebook_url' => $s->facebook_url,
            'tiktok_url' => $s->tiktok_url,
            'logo_url' => $s->logo_url,
        ]);
    }

    public function updateStore(UpdateStoreRequest $request): JsonResponse
    {
        $setting = StoreSetting::current();
        $data = $request->validated();

        $mapped = [
            'store_name' => 'store_name',
            'store_description' => 'slogan_line2',
            'store_phone' => 'phone_primary',
            'store_email' => 'meta_title',
            'store_address' => 'address_line',
            'delivery_fee' => 'delivery_fee',
            'free_delivery_threshold' => 'free_delivery_threshold',
            'slogan_line1' => 'slogan_line1',
            'slogan_highlight_phrase' => 'slogan_highlight_phrase',
            'instagram_url' => 'instagram_url',
            'facebook_url' => 'facebook_url',
            'tiktok_url' => 'tiktok_url',
        ];

        foreach ($mapped as $inputKey => $modelKey) {
            if (isset($data[$inputKey])) {
                $setting->$modelKey = $data[$inputKey];
            }
        }

        $setting->save();

        return response()->json([
            'ok' => true,
            'message' => 'تم حفظ الإعدادات بنجاح',
            'store' => $setting->toArray(),
        ]);
    }
}
