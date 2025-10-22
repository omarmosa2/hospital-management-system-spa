<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('doctor_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('doctors')->onDelete('cascade');

            // Schedule details
            $table->string('day_of_week'); // 'monday', 'tuesday', etc.
            $table->time('open_time')->nullable();
            $table->time('close_time')->nullable();
            $table->boolean('is_closed')->default(false);

            $table->timestamps();

            // Indexes for performance
            $table->index(['doctor_id', 'day_of_week']);
            $table->unique(['doctor_id', 'day_of_week']); // One schedule per day per doctor
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_schedules');
    }
};
