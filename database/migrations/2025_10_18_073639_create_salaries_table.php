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
        Schema::create('salaries', function (Blueprint $table) {
            $table->id();
            $table->string('salary_number')->unique();

            // Staff Information
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('employee_name'); // Snapshot of employee name
            $table->string('employee_id')->nullable(); // Hospital employee ID
            $table->string('position'); // Job title/position
            $table->string('department')->nullable();

            // Salary Details
            $table->enum('salary_type', ['monthly', 'hourly', 'daily'])->default('monthly');
            $table->decimal('base_salary', 10, 2);
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->decimal('overtime_rate', 10, 2)->nullable();

            // Allowances and Bonuses
            $table->decimal('housing_allowance', 10, 2)->default(0);
            $table->decimal('transport_allowance', 10, 2)->default(0);
            $table->decimal('medical_allowance', 10, 2)->default(0);
            $table->decimal('other_allowance', 10, 2)->default(0);

            // Deductions
            $table->decimal('tax_deduction', 10, 2)->default(0);
            $table->decimal('insurance_deduction', 10, 2)->default(0);
            $table->decimal('other_deduction', 10, 2)->default(0);

            // Period Information
            $table->date('period_start');
            $table->date('period_end');
            $table->integer('worked_hours')->nullable();
            $table->integer('overtime_hours')->default(0);

            // Final Calculations
            $table->decimal('gross_salary', 10, 2); // base + allowances
            $table->decimal('total_deductions', 10, 2); // sum of all deductions
            $table->decimal('net_salary', 10, 2); // gross - deductions

            // Payment Information
            $table->enum('status', ['draft', 'approved', 'paid', 'cancelled'])->default('draft');
            $table->string('payment_method')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_reference')->nullable();

            // Administrative
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes for performance
            $table->index(['user_id', 'period_start']);
            $table->index(['status', 'period_start']);
            $table->index(['department', 'period_start']);
            $table->index(['position', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salaries');
    }
};
