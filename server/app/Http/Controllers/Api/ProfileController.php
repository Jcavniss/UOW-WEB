<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->safe()->except(['password_confirmation', 'avatar']);

        if ($request->has('favorite_game_id') && $request->input('favorite_game_id') !== null) {
            $ownsGame = $user->userGames()
                ->where('game_id', $request->integer('favorite_game_id'))
                ->exists();

            if (! $ownsGame) {
                throw ValidationException::withMessages([
                    'favorite_game_id' => ['The favorite game must be in your library.'],
                ]);
            }
        }

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->string('password')->toString());
        } else {
            unset($data['password']);
        }

        if ($request->has('avatar')) {
            $data['avatar'] = $this->storeAvatar($request->input('avatar'), $user);
        }

        $user->update($data);
        $this->loadProfile($user);

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'Profile updated successfully',
        ]);
    }

    private function storeAvatar(?string $dataUri, User $user): ?string
    {
        if ($dataUri === null) {
            $this->deleteStoredAvatar($user);

            return null;
        }

        if (! preg_match('/^data:([a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+);base64,(.+)$/s', $dataUri, $matches)) {
            throw ValidationException::withMessages([
                'avatar' => ['The avatar must be a base64-encoded image.'],
            ]);
        }

        $contents = base64_decode($matches[2], true);
        if ($contents === false || strlen($contents) > 2 * 1024 * 1024) {
            throw ValidationException::withMessages([
                'avatar' => ['The avatar must not exceed 2 MB.'],
            ]);
        }

        $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($contents);
        $extension = match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => null,
        };

        if ($extension === null) {
            throw ValidationException::withMessages([
                'avatar' => ['The avatar must be a JPEG, PNG, or WebP image.'],
            ]);
        }

        $this->deleteStoredAvatar($user);
        $path = 'avatars/'.Str::uuid().'.'.$extension;
        Storage::disk('public')->put($path, $contents);

        return $path;
    }

    private function deleteStoredAvatar(User $user): void
    {
        if ($user->avatar && ! str_starts_with($user->avatar, 'http')) {
            Storage::disk('public')->delete($user->avatar);
        }
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
