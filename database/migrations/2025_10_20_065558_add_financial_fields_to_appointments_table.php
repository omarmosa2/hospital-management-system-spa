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
        Schema::table('appointments', function (Blueprint $table) {
            // الحقول المالية والطبية الجديدة
            $table->enum('visit_type', ['consultation', 'follow_up'])->default('consultation')->after('appointment_type');
            $table->decimal('base_consultation_fee', 10, 2)->default(0)->after('visit_type');
            $table->decimal('amount_received', 10, 2)->default(0)->after('base_consultation_fee');
            $table->decimal('center_discount', 10, 2)->default(0)->after('amount_received');
            $table->decimal('doctor_discount', 10, 2)->default(0)->after('center_discount');
            $table->decimal('additional_procedures_amount', 10, 2)->default(0)->after('doctor_discount');
            $table->text('additional_procedures')->nullable()->after('additional_procedures_amount');
            $table->decimal('doctor_consultation_fee', 10, 2)->default(0)->after('additional_procedures');
            $table->decimal('center_consultation_fee', 10, 2)->default(0)->after('doctor_consultation_fee');
            $table->decimal('doctor_procedures_fee', 10, 2)->default(0)->after('center_consultation_fee');
            $table->decimal('center_procedures_fee', 10, 2)->default(0)->after('doctor_procedures_fee');
            $table->decimal('total_doctor_fee', 10, 2)->default(0)->after('center_procedures_fee');
            $table->decimal('total_center_fee', 10, 2)->default(0)->after('total_doctor_fee');
            $table->boolean('is_first_visit_free')->default(false)->after('total_center_fee');
            $table->decimal('advance_payment', 10, 2)->default(0)->after('is_first_visit_free');
            $table->decimal('remaining_amount', 10, 2)->default(0)->after('advance_payment');
            $table->enum('payment_status', ['unpaid', 'partial', 'paid'])->default('unpaid')->after('remaining_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'visit_type',
                'base_consultation_fee',
                'amount_received',
                'center_discount',
                'doctor_discount',
                'additional_procedures_amount',
                'additional_procedures',
                'doctor_consultation_fee',
                'center_consultation_fee',
                'doctor_procedures_fee',
                'center_procedures_fee',
                'total_doctor_fee',
                'total_center_fee',
                'is_first_visit_free',
                'advance_payment',
                'remaining_amount',
                'payment_status'
            ]);
        });
    }
};
