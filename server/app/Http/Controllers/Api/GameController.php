<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Game\IndexGameRequest;
use App\Http\Requests\Game\RandomGameRequest;
use App\Http\Requests\Game\StoreGameRequest;
use App\Http\Requests\Game\UpdateGameRequest;
use App\Http\Resources\GameResource;
use App\Models\Game;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GameController extends Controller
{
    public function index(IndexGameRequest $request)
    {
        $query = $this->gameQuery($request->user('sanctum'));
        $this->applyFilters($query, $request->validated());

        $sortMap = [
            'title' => 'title',
            'release_date' => 'release_date',
            'average_rating' => 'ratings_avg_score',
            'ratings_count' => 'ratings_count',
            'created_at' => 'created_at',
        ];
        $sort = $request->validated('sort', 'title');
        $order = $request->validated('order', 'asc');

        $games = $query
            ->orderBy($sortMap[$sort], $order)
            ->paginate($request->integer('per_page', 12))
            ->withQueryString();

        return GameResource::collection($games)->additional([
            'message' => 'Games retrieved successfully',
        ]);
    }

    public function show(Request $request, Game $game): JsonResponse
    {
        $game = $this->gameQuery($request->user('sanctum'))
            ->whereKey($game->id)
            ->firstOrFail();

        return response()->json([
            'data' => new GameResource($game),
            'message' => 'Game retrieved successfully',
        ]);
    }

    public function store(StoreGameRequest $request): JsonResponse
    {
        $this->authorize('create', Game::class);
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['title']);
        $data['initials'] ??= $this->initials($data['title']);
        $data['color'] ??= '#8b5cf6';

        $game = Game::create($data);
        $game = $this->gameQuery($request->user())->whereKey($game->id)->firstOrFail();

        return response()->json([
            'data' => new GameResource($game),
            'message' => 'Game created successfully',
        ], 201);
    }

    public function update(UpdateGameRequest $request, Game $game): JsonResponse
    {
        $this->authorize('update', $game);
        $data = $request->validated();
        $game->update($data);
        $game = $this->gameQuery($request->user())->whereKey($game->id)->firstOrFail();

        return response()->json([
            'data' => new GameResource($game),
            'message' => 'Game updated successfully',
        ]);
    }

    public function destroy(Game $game)
    {
        $this->authorize('delete', $game);
        $game->delete();

        return response()->noContent();
    }

    public function random(RandomGameRequest $request): JsonResponse
    {
        $user = $request->user('sanctum');
        $source = $request->validated('source', 'catalog');

        if ($source === 'library' && ! $user) {
            return response()->json([
                'message' => 'Authentication required for library randomization',
                'errors' => [],
            ], 401);
        }

        $query = $this->gameQuery($user);

        if ($request->filled('genre')) {
            $query->whereLike('genre', $request->string('genre')->toString(), caseSensitive: false);
        }

        if ($source === 'library') {
            $query->whereHas('userGames', function (Builder $libraryQuery) use ($request, $user) {
                $libraryQuery->where('user_id', $user->id);
                if ($request->filled('status')) {
                    $libraryQuery->where('status', $request->string('status')->toString());
                }
            });
        }

        $game = $query->inRandomOrder()->first();
        if (! $game) {
            throw new NotFoundHttpException('No game matches the requested filters.');
        }

        return response()->json([
            'data' => new GameResource($game),
            'message' => 'Random game retrieved successfully',
        ]);
    }

    public function upcoming(Request $request)
    {
        $validated = $request->validate([
            'limit' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $games = $this->gameQuery($request->user('sanctum'))
            ->whereDate('release_date', '>', today())
            ->orderBy('release_date')
            ->limit($validated['limit'] ?? 10)
            ->get();

        return GameResource::collection($games)->additional([
            'message' => 'Upcoming games retrieved successfully',
        ]);
    }

    private function gameQuery(?User $user): Builder
    {
        $query = Game::query()
            ->withAvg('ratings', 'score')
            ->withCount('ratings');

        if ($user) {
            $query->with([
                'userGames' => fn ($relation) => $relation->where('user_id', $user->id),
                'ratings' => fn ($relation) => $relation->where('user_id', $user->id),
            ]);
        }

        return $query;
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if (! empty($filters['search'])) {
            $query->whereLike('title', '%'.$filters['search'].'%', caseSensitive: false);
        }
        if (! empty($filters['genre'])) {
            $query->whereLike('genre', $filters['genre'], caseSensitive: false);
        }
        if (! empty($filters['platform'])) {
            $query->whereJsonContains('platforms', $filters['platform']);
        }
        if (! empty($filters['release_date'])) {
            $query->whereDate('release_date', $filters['release_date']);
        }
        if (! empty($filters['released_from'])) {
            $query->whereDate('release_date', '>=', $filters['released_from']);
        }
        if (! empty($filters['released_to'])) {
            $query->whereDate('release_date', '<=', $filters['released_to']);
        }
        if (($filters['release_status'] ?? null) === 'upcoming') {
            $query->whereDate('release_date', '>', today());
        }
        if (($filters['release_status'] ?? null) === 'released') {
            $query->whereDate('release_date', '<=', today());
        }
    }

    private function uniqueSlug(string $value): string
    {
        $base = Str::slug($value) ?: 'game';
        $slug = $base;
        $suffix = 2;

        while (Game::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }

    private function initials(string $title): string
    {
        return Str::of($title)
            ->split('/\s+/')
            ->filter()
            ->take(2)
            ->map(fn ($word) => Str::upper(Str::substr($word, 0, 1)))
            ->join('');
    }
}
