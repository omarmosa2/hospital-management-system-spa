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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('appointment_number')->unique();

            // Foreign Keys
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('doctors')->onDelete('cascade');
            $table->foreignId('clinic_id')->constrained('clinics')->onDelete('cascade');

            // Appointment Details
            $table->datetime('scheduled_datetime');
            $table->datetime('end_datetime')->nullable();
            $table->enum('appointment_type', ['consultation', 'follow_up', 'emergency', 'routine_check', 'vaccination', 'other'])->default('consultation');
            $table->enum('status', ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'])->default('scheduled');

            // Duration and Notes
            $table->integer('duration_minutes')->default(30);
            $table->text('reason_for_visit')->nullable();
            $table->text('symptoms')->nullable();
            $table->text('notes')->nullable();

            // Administrative
            $table->foreignId('scheduled_by')->nullable()->constrained('users')->onDelete('set null'); // Who scheduled the appointment
            $table->timestamp('checked_in_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();

            // Follow-up
            $table->foreignId('follow_up_appointment_id')->nullable()->constrained('appointments')->onDelete('set null');

            $table->timestamps();

            // Indexes for performance
            $table->index(['patient_id', 'scheduled_datetime']);
            $table->index(['doctor_id', 'scheduled_datetime']);
            $table->index(['clinic_id', 'scheduled_datetime']);
            $table->index(['status', 'scheduled_datetime']);
            $table->index(['appointment_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
