<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Library\StoreUserGameRequest;
use App\Http\Requests\Library\UpdateUserGameRequest;
use App\Http\Resources\UserGameResource;
use App\Models\UserGame;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LibraryController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => ['sometimes', Rule::in(UserGame::STATUSES)],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $query = $this->libraryQuery($request);
        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        $entries = $query->latest('updated_at')
            ->paginate($validated['per_page'] ?? 20)
            ->withQueryString();

        return UserGameResource::collection($entries)->additional([
            'message' => 'Library retrieved successfully',
        ]);
    }

    public function store(StoreUserGameRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->userGames()->where('game_id', $request->integer('game_id'))->exists()) {
            return response()->json([
                'message' => 'The game is already in your library',
                'errors' => [
                    'game_id' => ['A game may only be added to your library once.'],
                ],
            ], 409);
        }

        $entry = $user->userGames()->create($request->validated());
        $entry = $this->libraryQuery($request)->whereKey($entry->id)->firstOrFail();

        return response()->json([
            'data' => new UserGameResource($entry),
            'message' => 'Game added to library successfully',
        ], 201);
    }

    public function show(Request $request, UserGame $userGame): JsonResponse
    {
        $this->authorize('view', $userGame);
        $entry = $this->libraryQuery($request)->whereKey($userGame->id)->firstOrFail();

        return response()->json([
            'data' => new UserGameResource($entry),
            'message' => 'Library entry retrieved successfully',
        ]);
    }

    public function update(UpdateUserGameRequest $request, UserGame $userGame): JsonResponse
    {
        $this->authorize('update', $userGame);
        $userGame->update($request->validated());
        $entry = $this->libraryQuery($request)->whereKey($userGame->id)->firstOrFail();

        return response()->json([
            'data' => new UserGameResource($entry),
            'message' => 'Library entry updated successfully',
        ]);
    }

    public function destroy(UserGame $userGame)
    {
        $this->authorize('delete', $userGame);
        $userGame->delete();

        return response()->noContent();
    }

    private function libraryQuery(Request $request): Builder
    {
        $user = $request->user();

        return UserGame::query()
            ->where('user_id', $user->id)
            ->with([
                'game' => fn ($gameQuery) => $gameQuery
                    ->withAvg('ratings', 'score')
                    ->withCount('ratings')
                    ->with([
                        'userGames' => fn ($relation) => $relation->where('user_id', $user->id),
                        'ratings' => fn ($relation) => $relation->where('user_id', $user->id),
                    ]),
            ]);
    }
}
