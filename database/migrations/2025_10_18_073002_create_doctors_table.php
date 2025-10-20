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
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('clinic_id')->nullable()->constrained('clinics')->onDelete('set null');

            // Professional details
            $table->string('license_number')->unique();
            $table->string('specialization');
            $table->string('qualification');
            $table->text('bio')->nullable();

            // Experience and availability
            $table->integer('years_of_experience')->default(0);
            $table->decimal('consultation_fee', 10, 2)->default(0);
            $table->integer('max_patients_per_day')->default(20);

            // Contact and location
            $table->string('office_phone')->nullable();
            $table->string('office_room')->nullable();

            // Status and scheduling
            $table->boolean('is_available')->default(true);
            $table->json('available_days')->nullable(); // ['monday', 'tuesday', ...]
            $table->time('start_time')->default('09:00:00');
            $table->time('end_time')->default('17:00:00');

            $table->timestamps();

            // Indexes for performance
            $table->index(['clinic_id', 'is_available']);
            $table->index(['specialization', 'is_available']);
            $table->unique(['user_id']); // One user can only be one doctor
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
