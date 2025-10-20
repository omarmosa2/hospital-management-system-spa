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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('service_code')->unique(); // e.g., "CONSULT", "XRAY", "LAB001"
            $table->string('name');
            $table->text('description')->nullable();

            // Service Details
            $table->enum('service_type', [
                'consultation', 'diagnostic', 'laboratory', 'radiology',
                'surgery', 'therapy', 'vaccination', 'emergency', 'other'
            ])->default('consultation');
            $table->enum('category', ['outpatient', 'inpatient', 'emergency', 'preventive'])->default('outpatient');

            // Pricing Information
            $table->decimal('base_price', 10, 2);
            $table->decimal('insurance_price', 10, 2)->nullable(); // Different price for insured patients
            $table->decimal('emergency_price', 10, 2)->nullable(); // Higher price for emergency services

            // Duration and Requirements
            $table->integer('estimated_duration_minutes')->default(30);
            $table->boolean('requires_appointment')->default(true);
            $table->boolean('requires_referral')->default(false);

            // Administrative
            $table->string('department')->nullable(); // Medical department providing this service
            $table->boolean('is_active')->default(true);
            $table->boolean('is_insurance_covered')->default(true);
            $table->decimal('tax_percentage', 5, 2)->default(0);

            // Service Requirements
            $table->text('requirements')->nullable(); // Special requirements or preparations
            $table->text('contraindications')->nullable(); // When this service shouldn't be provided

            $table->timestamps();

            // Indexes for performance
            $table->index(['service_type', 'is_active']);
            $table->index(['category', 'is_active']);
            $table->index(['department', 'is_active']);
            $table->index(['is_insurance_covered', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
