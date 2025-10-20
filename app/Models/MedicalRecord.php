<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'record_number',
        'patient_id',
        'doctor_id',
        'appointment_id',
        'clinic_id',
        'blood_pressure_systolic',
        'blood_pressure_diastolic',
        'heart_rate',
        'temperature',
        'weight',
        'height',
        'bmi',
        'oxygen_saturation',
        'chief_complaint',
        'history_of_present_illness',
        'past_medical_history',
        'family_medical_history',
        'social_history',
        'physical_examination',
        'systemic_examination',
        'diagnosis',
        'differential_diagnosis',
        'treatment_plan',
        'medications_prescribed',
        'follow_up_instructions',
        'record_type',
        'is_confidential',
        'created_by',
        'consultation_date',
    ];

    protected function casts(): array
    {
        return [
            'consultation_date' => 'datetime',
            'is_confidential' => 'boolean',
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

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
