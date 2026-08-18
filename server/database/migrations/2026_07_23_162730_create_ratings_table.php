<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('score');
            $table->text('review')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'game_id']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                'ALTER TABLE ratings ADD CONSTRAINT ratings_score_check CHECK (score BETWEEN 1 AND 10)'
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
