<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'username' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'date_of_birth' => '1990-01-15',
            'avatar_color' => '#ef4444',
            'bio' => 'Local development administrator.',
            'favorite_genre' => 'RPG',
            'role' => 'admin',
        ]);

        User::create([
            'username' => 'PixelKnight',
            'email' => 'player@example.com',
            'password' => Hash::make('password'),
            'date_of_birth' => '2000-04-12',
            'avatar_color' => '#8b5cf6',
            'bio' => 'Always looking for the next great story.',
            'favorite_genre' => 'Action RPG',
            'role' => 'user',
        ]);

        User::create([
            'username' => 'DemoPlayer',
            'email' => 'demo@example.com',
            'password' => Hash::make('password'),
            'avatar_color' => '#06b6d4',
            'favorite_genre' => 'Roguelite',
            'role' => 'user',
        ]);
    }
}
