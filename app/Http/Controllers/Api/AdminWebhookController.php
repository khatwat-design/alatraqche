<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Webhook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminWebhookController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $webhooks = Webhook::query()
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'ok' => true,
            'webhooks' => $webhooks,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $webhook = Webhook::query()->whereKey($id)->first();

        if (! $webhook) {
            return response()->json(['message' => 'الويبهوك غير موجود.'], 404);
        }

        return response()->json([
            'ok' => true,
            'webhook' => $webhook,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'url' => 'required|string|url|max:2048',
            'secret' => 'nullable|string|max:255',
            'events' => 'required|array',
            'events.*' => 'string|max:64',
            'is_active' => 'boolean',
        ]);

        $webhook = Webhook::query()->create([
            'url' => $data['url'],
            'secret' => $data['secret'] ?? null,
            'events' => $data['events'],
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json([
            'ok' => true,
            'message' => 'تم إضافة الويبهوك بنجاح.',
            'webhook' => $webhook,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $webhook = Webhook::query()->whereKey($id)->first();

        if (! $webhook) {
            return response()->json(['message' => 'الويبهوك غير موجود.'], 404);
        }

        $data = $request->validate([
            'url' => 'sometimes|string|url|max:2048',
            'secret' => 'nullable|string|max:255',
            'events' => 'sometimes|array',
            'events.*' => 'string|max:64',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($data['url'])) {
            $webhook->url = $data['url'];
        }
        if (array_key_exists('secret', $data)) {
            $webhook->secret = $data['secret'];
        }
        if (isset($data['events'])) {
            $webhook->events = $data['events'];
        }
        if (isset($data['is_active'])) {
            $webhook->is_active = (bool) $data['is_active'];
        }
        $webhook->save();

        return response()->json([
            'ok' => true,
            'message' => 'تم تحديث الويبهوك بنجاح.',
            'webhook' => $webhook,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $webhook = Webhook::query()->whereKey($id)->first();

        if (! $webhook) {
            return response()->json(['message' => 'الويبهوك غير موجود.'], 404);
        }

        $webhook->delete();

        return response()->json([
            'ok' => true,
            'message' => 'تم حذف الويبهوك بنجاح.',
        ]);
    }
}
