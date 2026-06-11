<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductCollection;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    public function index(Request $request): ProductCollection
    {
        $perPage = min((int) $request->query('per_page', 50), 100);
        $search = $request->query('search');

        $query = Product::query()
            ->with('category', 'options.values');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $products = $query->orderByDesc('created_at')->paginate($perPage);

        return new ProductCollection($products);
    }

    public function show(string $id): ProductResource|JsonResponse
    {
        $product = Product::query()
            ->with('category', 'options.values')
            ->whereKey($id)
            ->first();

        if (! $product) {
            return response()->json(['message' => 'المنتج غير موجود.'], 404);
        }

        return new ProductResource($product);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();

        $product = new Product();
        $product->id = str()->ulid();
        $product->name = $data['name'];
        $product->description = $data['description'] ?? '';
        $product->price = (int) $data['price'];
        $product->stock_qty = (int) ($data['stock'] ?? 0);
        $product->category_id = ! empty($data['category_id']) ? $data['category_id'] : null;
        $product->badge = $data['badge'] ?? null;
        $product->is_visible = $data['is_active'] ?? true;
        $product->sort_order = (int) ($data['sort_order'] ?? 0);
        $product->image = '';
        $product->save();

        $images = [];
        if ($request->hasFile('image')) {
            $images[] = $request->file('image');
        }
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $images[] = $file;
            }
        }

        if (empty($images)) {
            return response()->json([
                'ok' => true,
                'product' => new ProductResource($product),
            ], 201);
        }

        $primaryIdx = (int) ($request->input('primary_image', 0));

        foreach ($images as $i => $file) {
            $media = $product->addMedia($file)
                ->withCustomProperties(['is_primary' => $i === $primaryIdx])
                ->toMediaCollection('default');

            if ($i === $primaryIdx || ($i === 0 && ! $request->has('primary_image'))) {
                $product->image = $media->getUrl();
            }
        }

        $product->save();

        return response()->json([
            'ok' => true,
            'product' => new ProductResource($product),
        ], 201);
    }

    public function update(UpdateProductRequest $request, string $id): JsonResponse
    {
        $product = Product::query()->whereKey($id)->first();

        if (! $product) {
            return response()->json(['message' => 'المنتج غير موجود.'], 404);
        }

        $data = $request->validated();

        if (isset($data['name'])) {
            $product->name = $data['name'];
        }
        if (isset($data['description'])) {
            $product->description = $data['description'];
        }
        if (isset($data['price'])) {
            $product->price = (int) $data['price'];
        }
        if (isset($data['stock'])) {
            $product->stock_qty = (int) $data['stock'];
        }
        if (array_key_exists('category_id', $data)) {
            $product->category_id = ! empty($data['category_id']) ? $data['category_id'] : null;
        }
        if (array_key_exists('badge', $data)) {
            $product->badge = $data['badge'];
        }
        if (isset($data['is_active'])) {
            $product->is_visible = (bool) $data['is_active'];
        }
        if (isset($data['sort_order'])) {
            $product->sort_order = (int) $data['sort_order'];
        }

        $product->save();

        return response()->json([
            'ok' => true,
            'message' => 'تم تحديث المنتج بنجاح',
            'product' => new ProductResource($product->load('category', 'options.values')),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $product = Product::query()->whereKey($id)->first();

        if (! $product) {
            return response()->json(['message' => 'المنتج غير موجود.'], 404);
        }

        $product->delete();

        return response()->json([
            'ok' => true,
            'message' => 'تم حذف المنتج بنجاح',
        ]);
    }
}
