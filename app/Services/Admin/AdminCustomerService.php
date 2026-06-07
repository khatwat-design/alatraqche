<?php

namespace App\Services\Admin;

use App\Helpers\PhoneHelper;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminCustomerService
{
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        $perPage = min((int) ($filters['per_page'] ?? 50), 100);
        $search = $filters['search'] ?? null;

        $query = Customer::query();

        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    public function findOrFail(string $id): Customer
    {
        return Customer::query()->whereKey($id)->firstOrFail();
    }

    public function create(array $data): Customer
    {
        $customer = new Customer();
        $customer->name = $data['name'];
        $customer->phone = PhoneHelper::normalize($data['phone']);
        $customer->email = $data['email'] ?? null;
        $customer->notes = $data['notes'] ?? null;
        if (! empty($data['password'])) {
            $customer->password = bcrypt($data['password']);
        }
        $customer->save();

        return $customer;
    }

    public function update(Customer $customer, array $data): Customer
    {
        if (isset($data['name'])) {
            $customer->name = $data['name'];
        }
        if (isset($data['phone'])) {
            $customer->phone = PhoneHelper::normalize($data['phone']);
        }
        if (array_key_exists('email', $data)) {
            $customer->email = $data['email'];
        }
        if (array_key_exists('notes', $data)) {
            $customer->notes = $data['notes'];
        }

        $customer->save();

        return $customer;
    }

    public function delete(Customer $customer): void
    {
        $customer->orders()->update(['customer_id' => null]);
        $customer->tokens()->delete();
        $customer->delete();
    }

    public function getCustomerStats(Customer $customer): array
    {
        $stats = Order::where('customer_id', $customer->id)
            ->selectRaw('count(*) as orders_count')
            ->selectRaw('coalesce(sum(case when status != ? then total else 0 end), 0) as total_spent', ['cancelled'])
            ->first();

        return [
            'orders_count' => (int) ($stats->orders_count ?? 0),
            'total_spent' => (float) ($stats->total_spent ?? 0),
        ];
    }

    public function getRecentOrders(Customer $customer, int $limit = 10): array
    {
        return Order::where('customer_id', $customer->id)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (Order $o) => [
                'id' => $o->id,
                'invoice_id' => $o->invoice_id,
                'total' => (float) $o->total,
                'status' => $o->status,
                'created_at' => $o->created_at->toIso8601String(),
            ])
            ->values()
            ->all();
    }
}
