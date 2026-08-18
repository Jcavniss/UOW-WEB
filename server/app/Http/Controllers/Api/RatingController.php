<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Rating\StoreRatingRequest;
use App\Http\Requests\Rating\UpdateRatingRequest;
use App\Http\Resources\RatingResource;
use App\Models\Game;
use App\Models\Rating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class RatingController extends Controller
{
    public function index(Request $request, Game $game)
    {
        $validated = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $ratings = $game->ratings()
            ->with('user')
            ->latest()
            ->paginate($validated['per_page'] ?? 20)
            ->withQueryString();

        return RatingResource::collection($ratings)->additional([
            'message' => 'Ratings retrieved successfully',
        ]);
    }

    public function store(StoreRatingRequest $request, Game $game): JsonResponse
    {
        $user = $request->user();

        if ($game->ratings()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'You have already rated this game',
                'errors' => [
                    'game_id' => ['A user may only rate a game once.'],
                ],
            ], 409);
        }

        $rating = new Rating($request->validated());
        $rating->user()->associate($user);
        $rating->game()->associate($game);
        $rating->save();
        $rating->load('user');

        return response()->json([
            'data' => new RatingResource($rating),
            'message' => 'Rating created successfully',
        ], 201);
    }

    public function update(
        UpdateRatingRequest $request,
        Game $game,
        Rating $rating,
    ): JsonResponse {
        $this->ensureNestedRating($game, $rating);
        $this->authorize('update', $rating);
        $rating->update($request->validated());
        $rating->load('user');

        return response()->json([
            'data' => new RatingResource($rating),
            'message' => 'Rating updated successfully',
        ]);
    }

    public function destroy(Game $game, Rating $rating)
    {
        $this->ensureNestedRating($game, $rating);
        $this->authorize('delete', $rating);
        $rating->delete();

        return response()->noContent();
    }

    private function ensureNestedRating(Game $game, Rating $rating): void
    {
        if ($rating->game_id !== $game->id) {
            throw new NotFoundHttpException('Rating not found for this game.');
        }
    }
}
