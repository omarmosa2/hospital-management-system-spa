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
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->string('record_number')->unique();

            // Foreign Keys
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('doctors')->onDelete('cascade');
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->onDelete('cascade');
            $table->foreignId('clinic_id')->constrained('clinics')->onDelete('cascade');

            // Vital Signs
            $table->decimal('blood_pressure_systolic', 5, 2)->nullable();
            $table->decimal('blood_pressure_diastolic', 5, 2)->nullable();
            $table->decimal('heart_rate', 5, 2)->nullable();
            $table->decimal('temperature', 4, 1)->nullable();
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('height', 5, 2)->nullable();
            $table->decimal('bmi', 4, 2)->nullable();
            $table->string('oxygen_saturation')->nullable();

            // Chief Complaint & History
            $table->text('chief_complaint')->nullable();
            $table->text('history_of_present_illness')->nullable();
            $table->text('past_medical_history')->nullable();
            $table->text('family_medical_history')->nullable();
            $table->text('social_history')->nullable();

            // Physical Examination
            $table->text('physical_examination')->nullable();
            $table->text('systemic_examination')->nullable();

            // Assessment & Plan
            $table->text('diagnosis')->nullable();
            $table->text('differential_diagnosis')->nullable();
            $table->text('treatment_plan')->nullable();
            $table->text('medications_prescribed')->nullable();
            $table->text('follow_up_instructions')->nullable();

            // Administrative
            $table->enum('record_type', ['consultation', 'emergency', 'surgery', 'discharge', 'other'])->default('consultation');
            $table->boolean('is_confidential')->default(false);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('consultation_date');

            $table->timestamps();

            // Indexes for performance
            $table->index(['patient_id', 'consultation_date']);
            $table->index(['doctor_id', 'consultation_date']);
            $table->index(['record_type', 'consultation_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
