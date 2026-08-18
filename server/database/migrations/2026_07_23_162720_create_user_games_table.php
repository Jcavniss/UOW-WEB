<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->string('status')->index();
            $table->text('personal_notes')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'game_id']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                "ALTER TABLE user_games ADD CONSTRAINT user_games_status_check CHECK (status IN ('playing', 'completed', 'planned', 'dropped', 'on_hold'))"
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_games');
    }
};
