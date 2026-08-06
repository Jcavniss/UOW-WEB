<?php

namespace App\Providers;

use App\Models\Game;
use App\Models\Rating;
use App\Models\UserGame;
use App\Policies\GamePolicy;
use App\Policies\RatingPolicy;
use App\Policies\UserGamePolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Game::class, GamePolicy::class);
        Gate::policy(UserGame::class, UserGamePolicy::class);
        Gate::policy(Rating::class, RatingPolicy::class);

        RateLimiter::for('auth', function (Request $request) {
            $email = Str::lower((string) $request->input('email'));

            return Limit::perMinute(5)->by($email.'|'.$request->ip());
        });
    }
}
