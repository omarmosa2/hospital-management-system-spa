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
        Schema::create('clinics', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('specialty')->nullable(); // Medical specialty
            $table->text('description')->nullable();
            $table->string('location')->nullable(); // Room/Floor number
            $table->string('phone')->nullable();
            $table->string('email')->nullable();

            // Working hours
            $table->time('start_time')->default('08:00:00');
            $table->time('end_time')->default('18:00:00');
            $table->json('working_days')->nullable(); // ['monday', 'tuesday', ...]

            // Operational details
            $table->integer('max_patients_per_day')->default(50);
            $table->integer('consultation_duration_minutes')->default(30);
            $table->boolean('is_active')->default(true);

            // Department head (optional)
            $table->foreignId('head_doctor_id')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();

            // Indexes for performance
            $table->index(['is_active', 'name']);
            $table->index(['specialty']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinics');
    }
};
