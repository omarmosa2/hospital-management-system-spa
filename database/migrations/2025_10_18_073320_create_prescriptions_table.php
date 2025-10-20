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
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->string('prescription_number')->unique();

            // Foreign Keys
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('doctors')->onDelete('cascade');
            $table->foreignId('medical_record_id')->nullable()->constrained('medical_records')->onDelete('cascade');
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->onDelete('cascade');

            // Medication Details
            $table->string('medication_name');
            $table->string('generic_name')->nullable();
            $table->string('brand_name')->nullable();
            $table->enum('medication_type', ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'other'])->default('tablet');

            // Dosage Information
            $table->string('dosage'); // e.g., "500mg", "10ml"
            $table->string('frequency'); // e.g., "twice daily", "every 6 hours"
            $table->integer('duration_days')->nullable();
            $table->integer('quantity')->nullable(); // Total quantity prescribed

            // Instructions
            $table->text('instructions')->nullable(); // How to take medication
            $table->text('special_instructions')->nullable(); // Additional notes
            $table->boolean('is_prn')->default(false); // As needed medication

            // Administrative
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->enum('status', ['active', 'completed', 'discontinued', 'expired'])->default('active');
            $table->boolean('refills_allowed')->default(false);
            $table->integer('refills_remaining')->default(0);

            // Pharmacy Information
            $table->string('pharmacy_name')->nullable();
            $table->text('pharmacy_notes')->nullable();

            $table->timestamps();

            // Indexes for performance
            $table->index(['patient_id', 'status']);
            $table->index(['doctor_id', 'start_date']);
            $table->index(['medication_name', 'status']);
            $table->index(['status', 'start_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
