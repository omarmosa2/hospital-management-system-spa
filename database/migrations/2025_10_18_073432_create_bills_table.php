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
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->string('bill_number')->unique();

            // Foreign Keys
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->onDelete('cascade');

            // Bill Details
            $table->date('bill_date');
            $table->date('due_date');
            $table->enum('bill_type', ['outpatient', 'inpatient', 'emergency', 'insurance', 'other'])->default('outpatient');
            $table->enum('status', ['draft', 'issued', 'paid', 'partially_paid', 'overdue', 'cancelled'])->default('draft');

            // Financial Information
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->decimal('remaining_amount', 10, 2)->default(0);

            // Payment Information
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_method')->nullable(); // cash, card, insurance, etc.
            $table->string('payment_reference')->nullable(); // Transaction ID, check number, etc.

            // Insurance Information
            $table->boolean('is_insurance_claim')->default(false);
            $table->string('insurance_company')->nullable();
            $table->string('policy_number')->nullable();
            $table->decimal('insurance_coverage', 10, 2)->default(0);
            $table->decimal('patient_responsibility', 10, 2)->default(0);

            // Administrative
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();

            // Indexes for performance
            $table->index(['patient_id', 'status']);
            $table->index(['status', 'bill_date']);
            $table->index(['bill_type', 'status']);
            $table->index(['is_insurance_claim', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
