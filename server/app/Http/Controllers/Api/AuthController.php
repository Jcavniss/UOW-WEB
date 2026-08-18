<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            ...$request->safe()->except('password'),
            'password' => Hash::make($request->string('password')->toString()),
            'role' => 'user',
        ]);

        $token = $user->createToken('gamerdiary-web')->plainTextToken;
        $this->loadProfile($user);

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
            'message' => 'Registration completed successfully',
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->string('email')->lower()->toString())->first();

        if (! $user || ! Hash::check($request->string('password')->toString(), $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password',
                'errors' => [
                    'email' => ['The provided credentials are incorrect.'],
                ],
            ], 401);
        }

        $token = $user->createToken('gamerdiary-web')->plainTextToken;
        $this->loadProfile($user);

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
            'message' => 'Login completed successfully',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'data' => null,
            'message' => 'Logout completed successfully',
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->loadProfile($user);

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'Current user retrieved successfully',
        ]);
    }

    private function loadProfile(User $user): void
    {
        $user->load('favoriteGame')->loadCount([
            'userGames as library_count',
            'userGames as games_played' => fn ($query) => $query->where('status', 'completed'),
            'ratings',
        ]);
    }
}
