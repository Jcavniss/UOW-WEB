<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GameResource;
use App\Models\Game;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function index(Request $request)
    {
        $query = Game::query();
        $query->when($request->string('search')->toString(), fn ($builder, $search) => $builder->where('title', 'like', '%'.$search.'%'));
        $query->when($request->string('genre')->toString(), fn ($builder, $genre) => $builder->where('genre', $genre));

        return GameResource::collection($query->orderBy('title')->paginate(min($request->integer('per_page', 12), 50)));
    }

    public function show(Game $game): GameResource
    {
        return new GameResource($game);
    }

    public function random(): GameResource
    {
        return new GameResource(Game::query()->inRandomOrder()->firstOrFail());
    }

    public function upcoming(Request $request)
    {
        return GameResource::collection(
            Game::query()->whereDate('release_date', '>', today())->orderBy('release_date')->limit(min($request->integer('limit', 10), 50))->get()
        );
    }
}
