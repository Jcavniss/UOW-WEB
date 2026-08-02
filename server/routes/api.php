<?php

use App\Http\Controllers\Api\GameController;
use Illuminate\Support\Facades\Route;

Route::get('/games', [GameController::class, 'index']);
Route::get('/games/random', [GameController::class, 'random']);
Route::get('/games/upcoming', [GameController::class, 'upcoming']);
Route::get('/games/{game}', [GameController::class, 'show']);
