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
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Personal Information
            $table->string('patient_id')->unique(); // Hospital patient ID
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('phone');
            $table->string('emergency_contact');
            $table->string('emergency_phone');
            $table->text('address')->nullable();

            // Medical Information
            $table->string('blood_type')->nullable();
            $table->decimal('height_cm')->nullable();
            $table->decimal('weight_kg')->nullable();
            $table->text('allergies')->nullable();
            $table->text('medical_conditions')->nullable();
            $table->text('current_medications')->nullable();

            // Insurance Information
            $table->string('insurance_provider')->nullable();
            $table->string('insurance_number')->nullable();
            $table->string('policy_holder')->nullable();

            // Administrative
            $table->foreignId('primary_doctor_id')->nullable()->constrained('doctors')->onDelete('set null');
            $table->foreignId('preferred_clinic_id')->nullable()->constrained('clinics')->onDelete('set null');
            $table->boolean('is_active')->default(true);
            $table->timestamp('first_visit_date')->nullable();
            $table->timestamp('last_visit_date')->nullable();

            $table->timestamps();

            // Indexes for performance
            $table->index(['patient_id', 'is_active']);
            $table->index(['primary_doctor_id', 'is_active']);
            $table->index(['preferred_clinic_id', 'is_active']);
            $table->unique(['user_id']); // One user can only be one patient
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
