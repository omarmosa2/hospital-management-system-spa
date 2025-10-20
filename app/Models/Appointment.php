<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_number',
        'patient_id',
        'doctor_id',
        'clinic_id',
        'scheduled_datetime',
        'end_datetime',
        'appointment_type',
        'status',
        'duration_minutes',
        'reason_for_visit',
        'symptoms',
        'notes',
        'scheduled_by',
        'checked_in_at',
        'completed_at',
        'cancelled_at',
        'cancellation_reason',
        'follow_up_appointment_id',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_datetime' => 'datetime',
            'end_datetime' => 'datetime',
            'checked_in_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }

    public function scheduledBy()
    {
        return $this->belongsTo(User::class, 'scheduled_by');
    }

    public function medicalRecord()
    {
        return $this->hasOne(MedicalRecord::class);
    }
}
