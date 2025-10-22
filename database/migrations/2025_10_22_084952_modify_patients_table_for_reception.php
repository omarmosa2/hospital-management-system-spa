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
        Schema::table('patients', function (Blueprint $table) {
            // First drop foreign key constraints
            $table->dropForeign(['primary_doctor_id']);
            $table->dropForeign(['preferred_clinic_id']);

            // Drop old fields not needed for reception
            $table->dropColumn([
                'first_name', 'last_name', 'middle_name',
                'emergency_contact', 'emergency_phone',
                'blood_type', 'height_cm', 'weight_kg',
                'allergies', 'medical_conditions', 'current_medications',
                'insurance_provider', 'insurance_number', 'policy_holder',
                'primary_doctor_id', 'preferred_clinic_id',
                'first_visit_date', 'last_visit_date'
            ]);

            // Modify existing fields for reception requirements
            $table->string('full_name')->after('user_id'); // الاسم الثلاثي
            $table->string('gender')->nullable()->change(); // Make nullable for now
            $table->text('address')->nullable()->change(); // مكان الإقامة
            $table->string('phone')->nullable()->change(); // رقم التواصل
            $table->string('email')->nullable(); // البريد الإلكتروني

            // Add new fields for reception
            $table->string('identity_number')->nullable()->unique()->after('patient_id'); // رقم الإضبارة
            $table->integer('age')->nullable()->after('date_of_birth'); // العمر (calculated)
            $table->text('notes')->nullable(); // ملاحظات إضافية

            // Audit fields
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null'); // Staff who created
            $table->timestamp('created_at_staff')->nullable(); // Timestamp when staff created

            // Update indexes
            $table->dropIndex(['patient_id', 'is_active']);
            $table->index(['patient_id', 'is_active']);
            $table->index(['identity_number']);
            $table->index(['phone']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            // Revert changes - add back dropped columns
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('emergency_contact');
            $table->string('emergency_phone');
            $table->string('blood_type')->nullable();
            $table->decimal('height_cm')->nullable();
            $table->decimal('weight_kg')->nullable();
            $table->text('allergies')->nullable();
            $table->text('medical_conditions')->nullable();
            $table->text('current_medications')->nullable();
            $table->string('insurance_provider')->nullable();
            $table->string('insurance_number')->nullable();
            $table->string('policy_holder')->nullable();
            $table->foreignId('primary_doctor_id')->nullable()->constrained('doctors')->onDelete('set null');
            $table->foreignId('preferred_clinic_id')->nullable()->constrained('clinics')->onDelete('set null');
            $table->timestamp('first_visit_date')->nullable();
            $table->timestamp('last_visit_date')->nullable();

            // Drop new columns
            $table->dropColumn([
                'full_name', 'email', 'identity_number', 'age', 'notes', 'created_by', 'created_at_staff'
            ]);

            // Revert gender and address to original
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->text('address')->nullable();
            $table->string('phone');

            // Revert indexes
            $table->dropIndex(['identity_number']);
            $table->dropIndex(['phone']);
            $table->index(['patient_id', 'is_active']);
            $table->index(['preferred_clinic_id', 'is_active']);
        });
    }
};
