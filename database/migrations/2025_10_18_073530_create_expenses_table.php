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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('expense_number')->unique();

            // Expense Details
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('category', [
                'medical_supplies', 'equipment', 'medications', 'utilities',
                'maintenance', 'staff_training', 'insurance', 'rent',
                'office_supplies', 'technology', 'other'
            ])->default('other');
            $table->enum('type', ['recurring', 'one_time'])->default('one_time');

            // Financial Information
            $table->decimal('amount', 10, 2);
            $table->enum('currency', ['USD', 'EUR', 'GBP', 'JOD'])->default('USD');
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2); // amount + tax

            // Dates
            $table->date('expense_date');
            $table->date('due_date')->nullable();
            $table->enum('status', ['pending', 'approved', 'paid', 'cancelled'])->default('pending');

            // Vendor Information
            $table->string('vendor_name')->nullable();
            $table->string('vendor_contact')->nullable();
            $table->text('vendor_address')->nullable();

            // Payment Information
            $table->string('payment_method')->nullable();
            $table->string('payment_reference')->nullable(); // Receipt number, check number, etc.
            $table->timestamp('paid_at')->nullable();

            // Administrative
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->text('cancellation_reason')->nullable();

            // Recurring Expense Fields
            $table->enum('frequency', ['daily', 'weekly', 'monthly', 'quarterly', 'annually'])->nullable();
            $table->date('next_due_date')->nullable();
            $table->integer('recurring_expense_id')->nullable(); // Self-reference for recurring expenses

            $table->timestamps();

            // Indexes for performance
            $table->index(['category', 'expense_date']);
            $table->index(['status', 'expense_date']);
            $table->index(['type', 'status']);
            $table->index(['created_by', 'expense_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
