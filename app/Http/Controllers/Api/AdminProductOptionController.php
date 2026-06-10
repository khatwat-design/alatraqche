<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductOptionResource;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductOptionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $options = ProductOption::query()
            ->with('values')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'ok' => true,
            'options' => ProductOptionResource::collection($options),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $option = ProductOption::query()
            ->with('values')
            ->whereKey($id)
            ->first();

        if (! $option) {
            return response()->json(['message' => 'الخيار غير موجود.'], 404);
        }

        return response()->json([
            'ok' => true,
            'option' => new ProductOptionResource($option),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:product_options,slug',
            'type' => 'required|in:select,radio,checkbox,color',
            'values' => 'nullable|array',
            'values.*.value' => 'required_with:values|string|max:255',
            'values.*.price_adjustment' => 'nullable|numeric',
            'values.*.sort_order' => 'nullable|integer',
        ]);

        $option = ProductOption::query()->create([
            'name' => $data['name'],
            'slug' => $data['slug'] ?? str()->slug($data['name']),
            'type' => $data['type'],
        ]);

        if (! empty($data['values'])) {
            foreach ($data['values'] as $i => $v) {
                $option->values()->create([
                    'value' => $v['value'],
                    'price_adjustment' => $v['price_adjustment'] ?? 0,
                    'sort_order' => $v['sort_order'] ?? $i,
                ]);
            }
        }

        $option->load('values');

        return response()->json([
            'ok' => true,
            'message' => 'تم إضافة الخيار بنجاح.',
            'option' => new ProductOptionResource($option),
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $option = ProductOption::query()->whereKey($id)->first();

        if (! $option) {
            return response()->json(['message' => 'الخيار غير موجود.'], 404);
        }

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:product_options,slug,' . $id,
            'type' => 'sometimes|in:select,radio,checkbox,color',
        ]);

        if (isset($data['name'])) {
            $option->name = $data['name'];
        }
        if (isset($data['slug'])) {
            $option->slug = $data['slug'];
        }
        if (isset($data['type'])) {
            $option->type = $data['type'];
        }
        $option->save();

        $option->load('values');

        return response()->json([
            'ok' => true,
            'message' => 'تم تحديث الخيار بنجاح.',
            'option' => new ProductOptionResource($option),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $option = ProductOption::query()->whereKey($id)->first();

        if (! $option) {
            return response()->json(['message' => 'الخيار غير موجود.'], 404);
        }

        $option->values()->delete();
        $option->delete();

        return response()->json([
            'ok' => true,
            'message' => 'تم حذف الخيار بنجاح.',
        ]);
    }

    public function storeValue(Request $request, string $optionId): JsonResponse
    {
        $option = ProductOption::query()->whereKey($optionId)->first();

        if (! $option) {
            return response()->json(['message' => 'الخيار غير موجود.'], 404);
        }

        $data = $request->validate([
            'value' => 'required|string|max:255',
            'price_adjustment' => 'nullable|numeric',
            'sort_order' => 'nullable|integer',
        ]);

        $value = $option->values()->create([
            'value' => $data['value'],
            'price_adjustment' => $data['price_adjustment'] ?? 0,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json([
            'ok' => true,
            'message' => 'تم إضافة القيمة بنجاح.',
            'value' => $value,
        ], 201);
    }

    public function updateValue(Request $request, string $optionId, string $valueId): JsonResponse
    {
        $option = ProductOption::query()->whereKey($optionId)->first();

        if (! $option) {
            return response()->json(['message' => 'الخيار غير موجود.'], 404);
        }

        $value = ProductOptionValue::query()
            ->where('product_option_id', $optionId)
            ->whereKey($valueId)
            ->first();

        if (! $value) {
            return response()->json(['message' => 'القيمة غير موجودة.'], 404);
        }

        $data = $request->validate([
            'value' => 'sometimes|string|max:255',
            'price_adjustment' => 'sometimes|numeric',
            'sort_order' => 'sometimes|integer',
        ]);

        if (isset($data['value'])) {
            $value->value = $data['value'];
        }
        if (isset($data['price_adjustment'])) {
            $value->price_adjustment = $data['price_adjustment'];
        }
        if (isset($data['sort_order'])) {
            $value->sort_order = $data['sort_order'];
        }
        $value->save();

        return response()->json([
            'ok' => true,
            'message' => 'تم تحديث القيمة بنجاح.',
            'value' => $value,
        ]);
    }

    public function destroyValue(string $optionId, string $valueId): JsonResponse
    {
        $option = ProductOption::query()->whereKey($optionId)->first();

        if (! $option) {
            return response()->json(['message' => 'الخيار غير موجود.'], 404);
        }

        $value = ProductOptionValue::query()
            ->where('product_option_id', $optionId)
            ->whereKey($valueId)
            ->first();

        if (! $value) {
            return response()->json(['message' => 'القيمة غير موجودة.'], 404);
        }

        $value->delete();

        return response()->json([
            'ok' => true,
            'message' => 'تم حذف القيمة بنجاح.',
        ]);
    }
}
