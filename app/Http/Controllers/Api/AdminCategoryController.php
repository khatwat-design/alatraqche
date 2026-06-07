<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\CategoryCollection;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class AdminCategoryController extends Controller
{
    public function index(): CategoryCollection
    {
        $categories = Category::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return new CategoryCollection($categories);
    }

    public function show(string $id): CategoryResource|JsonResponse
    {
        $category = Category::find($id);

        if (! $category) {
            return response()->json(['message' => 'التصنيف غير موجود.'], 404);
        }

        return new CategoryResource($category);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();

        $category = Category::create([
            'id' => $data['id'] ?? \Illuminate\Support\Str::slug($data['name']),
            'name' => $data['name'],
            'description' => $data['description'] ?? '',
            'sort_order' => (int) ($data['sort_order'] ?? ((int) Category::max('sort_order')) + 1),
        ]);

        return response()->json([
            'ok' => true,
            'message' => 'تم إنشاء التصنيف بنجاح',
            'category' => new CategoryResource($category),
        ], 201);
    }

    public function update(UpdateCategoryRequest $request, string $id): JsonResponse
    {
        $category = Category::find($id);

        if (! $category) {
            return response()->json(['message' => 'التصنيف غير موجود.'], 404);
        }

        $data = $request->validated();

        if (isset($data['name'])) {
            $category->name = $data['name'];
        }
        if (isset($data['description'])) {
            $category->description = $data['description'];
        }
        if (isset($data['sort_order'])) {
            $category->sort_order = (int) $data['sort_order'];
        }

        $category->save();

        return response()->json([
            'ok' => true,
            'message' => 'تم تحديث التصنيف بنجاح',
            'category' => new CategoryResource($category),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $category = Category::find($id);

        if (! $category) {
            return response()->json(['message' => 'التصنيف غير موجود.'], 404);
        }

        if ($category->products()->count() > 0) {
            return response()->json([
                'message' => 'لا يمكن حذف التصنيف لأنه مرتبط بمنتجات.',
            ], 409);
        }

        $category->delete();

        return response()->json([
            'ok' => true,
            'message' => 'تم حذف التصنيف بنجاح',
        ]);
    }
}
