<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::query()->where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'بيانات الدخول غير صحيحة.',
            ], 401);
        }

        $token = $user->createToken('admin')->plainTextToken;

        return response()->json([
            'token' => $token,
            'tokenType' => 'Bearer',
            'user' => new UserResource($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['ok' => true]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (isset($data['name'])) {
            $parts = explode(' ', trim($data['name']), 2);
            $user->first_name = $parts[0];
            $user->last_name = $parts[1] ?? '';
        }
        if (isset($data['email'])) {
            $user->email = $data['email'];
        }
        if (isset($data['phone'])) {
            $user->phone_number = $data['phone'];
        }
        if (isset($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return response()->json([
            'ok' => true,
            'message' => 'تم تحديث الملف الشخصي بنجاح',
            'user' => new UserResource($user),
        ]);
    }
}
