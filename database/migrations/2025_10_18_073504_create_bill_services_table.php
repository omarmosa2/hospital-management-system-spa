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
        Schema::create('bill_services', function (Blueprint $table) {
            $table->id();

            // Foreign Keys
            $table->foreignId('bill_id')->constrained('bills')->onDelete('cascade');
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');

            // Service Details at Time of Billing
            $table->string('service_name'); // Snapshot of service name
            $table->string('service_code'); // Snapshot of service code
            $table->text('service_description')->nullable(); // Snapshot of description

            // Pricing Information
            $table->decimal('unit_price', 10, 2); // Price per unit at time of service
            $table->integer('quantity')->default(1);
            $table->decimal('total_price', 10, 2); // unit_price * quantity

            // Discount and Tax
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('final_price', 10, 2); // After discount and tax

            // Service Date
            $table->date('service_date');
            $table->foreignId('performed_by')->nullable()->constrained('users')->onDelete('set null'); // Doctor/Nurse who performed service

            $table->timestamps();

            // Ensure a service can only appear once per bill
            $table->unique(['bill_id', 'service_id', 'service_date']);

            // Indexes for performance
            $table->index(['bill_id', 'service_date']);
            $table->index(['service_id', 'service_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bill_services');
    }
};
