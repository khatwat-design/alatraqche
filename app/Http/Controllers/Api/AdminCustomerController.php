<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCustomerRequest;
use App\Http\Requests\Admin\UpdateCustomerRequest;
use App\Http\Resources\CustomerCollection;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Services\Admin\AdminCustomerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCustomerController extends Controller
{
    public function __construct(
        private readonly AdminCustomerService $customerService
    ) {}

    public function index(Request $request): CustomerCollection
    {
        $customers = $this->customerService->paginate($request->only(['per_page', 'search']));

        return new CustomerCollection($customers);
    }

    public function show(string $id): CustomerResource|JsonResponse
    {
        try {
            $customer = $this->customerService->findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'العميل غير موجود.'], 404);
        }

        $customer->loadCount('orders');

        $customer->total_spent = (float) $customer->orders()
            ->where('status', '!=', 'cancelled')
            ->sum('total');

        $customer->setRelation('recentOrders', $customer->orders()
            ->orderByDesc('created_at')
            ->limit(10)
            ->get());

        return new CustomerResource($customer);
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $customer = $this->customerService->create($request->validated());

        return response()->json([
            'ok' => true,
            'customer' => new CustomerResource($customer),
        ], 201);
    }

    public function update(UpdateCustomerRequest $request, string $id): JsonResponse
    {
        try {
            $customer = $this->customerService->findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'العميل غير موجود.'], 404);
        }

        $this->customerService->update($customer, $request->validated());

        return response()->json([
            'ok' => true,
            'message' => 'تم تحديث العميل بنجاح',
            'customer' => new CustomerResource($customer),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $customer = $this->customerService->findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'العميل غير موجود.'], 404);
        }

        $this->customerService->delete($customer);

        return response()->json([
            'ok' => true,
            'message' => 'تم حذف العميل بنجاح',
        ]);
    }
}
