<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()->where('is_admin', true)->orderBy('created_at', 'desc')->get();

        return response()->json([
            'users' => UserResource::collection($users),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::query()->where('is_admin', true)->findOrFail($id);

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['required', Rule::in(['admin', 'manager', 'editor', 'viewer'])],
            'job_title' => ['nullable', 'string', 'max:100'],
        ]);

        $user = User::query()->create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone_number' => $validated['phone'] ?? null,
            'is_admin' => true,
            'role' => $validated['role'],
            'job_title' => $validated['job_title'] ?? null,
        ]);

        return response()->json([
            'ok' => true,
            'message' => 'تم إنشاء المستخدم بنجاح',
            'user' => new UserResource($user),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::query()->where('is_admin', true)->findOrFail($id);

        $validated = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['sometimes', Rule::in(['admin', 'manager', 'editor', 'viewer'])],
            'job_title' => ['nullable', 'string', 'max:100'],
        ]);

        $data = [];
        if (isset($validated['first_name'])) $data['first_name'] = $validated['first_name'];
        if (isset($validated['last_name'])) $data['last_name'] = $validated['last_name'];
        if (isset($validated['email'])) $data['email'] = $validated['email'];
        if (isset($validated['phone'])) $data['phone_number'] = $validated['phone'];
        if (isset($validated['role'])) $data['role'] = $validated['role'];
        if (array_key_exists('job_title', $validated)) $data['job_title'] = $validated['job_title'];
        if (!empty($validated['password'])) $data['password'] = Hash::make($validated['password']);

        $user->update($data);

        return response()->json([
            'ok' => true,
            'message' => 'تم تحديث المستخدم بنجاح',
            'user' => new UserResource($user->fresh()),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = User::query()->where('is_admin', true)->findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'لا يمكن حذف حسابك الخاص.'], 422);
        }

        $user->delete();

        return response()->json([
            'ok' => true,
            'message' => 'تم حذف المستخدم بنجاح',
        ]);
    }
}
