<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RatingController;
use App\Models\Game;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/games', [GameController::class, 'index']);
Route::get('/games/random', [GameController::class, 'random']);
Route::get('/games/upcoming', [GameController::class, 'upcoming']);
Route::get('/games/{game}/ratings', [RatingController::class, 'index']);
Route::get('/games/{game}', [GameController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [ProfileController::class, 'update']);

    Route::apiResource('/library', LibraryController::class)
        ->parameters(['library' => 'userGame']);

    Route::post('/games/{game}/ratings', [RatingController::class, 'store']);
    Route::match(['put', 'patch'], '/games/{game}/ratings/{rating}', [RatingController::class, 'update']);
    Route::delete('/games/{game}/ratings/{rating}', [RatingController::class, 'destroy']);

    Route::post('/games', [GameController::class, 'store'])
        ->middleware('can:create,'.Game::class);
    Route::match(['put', 'patch'], '/games/{game}', [GameController::class, 'update'])
        ->middleware('can:update,game');
    Route::delete('/games/{game}', [GameController::class, 'destroy'])
        ->middleware('can:delete,game');
});
