<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'patient_id',
        'first_name',
        'last_name',
        'middle_name',
        'date_of_birth',
        'gender',
        'phone',
        'emergency_contact',
        'emergency_phone',
        'address',
        'blood_type',
        'height_cm',
        'weight_kg',
        'allergies',
        'medical_conditions',
        'current_medications',
        'insurance_provider',
        'insurance_number',
        'policy_holder',
        'primary_doctor_id',
        'preferred_clinic_id',
        'is_active',
        'first_visit_date',
        'last_visit_date',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'height_cm' => 'decimal:2',
            'weight_kg' => 'decimal:2',
            'is_active' => 'boolean',
            'first_visit_date' => 'datetime',
            'last_visit_date' => 'datetime',
        ];
    }

    /**
     * Get the user associated with this patient.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the primary doctor for this patient.
     */
    public function primaryDoctor()
    {
        return $this->belongsTo(Doctor::class, 'primary_doctor_id');
    }

    /**
     * Get the preferred clinic for this patient.
     */
    public function preferredClinic()
    {
        return $this->belongsTo(Clinic::class, 'preferred_clinic_id');
    }

    /**
     * Get the appointments for this patient.
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get the medical records for this patient.
     */
    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class);
    }

    /**
     * Get the prescriptions for this patient.
     */
    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    /**
     * Get the bills for this patient.
     */
    public function bills()
    {
        return $this->hasMany(Bill::class);
    }

    /**
     * Get the patient's full name.
     */
    public function getFullNameAttribute()
    {
        $middle = $this->middle_name ? ' ' . $this->middle_name . ' ' : ' ';
        return $this->first_name . $middle . $this->last_name;
    }

    /**
     * Get the patient's age.
     */
    public function getAgeAttribute()
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

    /**
     * Get the patient's BMI.
     */
    public function getBmiAttribute()
    {
        if ($this->height_cm && $this->weight_kg) {
            $height_m = $this->height_cm / 100;
            return round($this->weight_kg / ($height_m * $height_m), 2);
        }
        return null;
    }

    /**
     * Check if patient is currently active.
     */
    public function isActive()
    {
        return $this->is_active;
    }

    /**
     * Get patient's latest appointment.
     */
    public function latestAppointment()
    {
        return $this->appointments()->latest('scheduled_datetime')->first();
    }

    /**
     * Get patient's upcoming appointments.
     */
    public function upcomingAppointments()
    {
        return $this->appointments()
            ->where('scheduled_datetime', '>', now())
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->orderBy('scheduled_datetime')
            ->get();
    }

    /**
     * Get patient's medical history summary.
     */
    public function getMedicalHistorySummary()
    {
        return [
            'total_appointments' => $this->appointments()->count(),
            'total_medical_records' => $this->medical_records()->count(),
            'total_prescriptions' => $this->prescriptions()->count(),
            'last_visit' => $this->last_visit_date,
            'blood_type' => $this->blood_type,
            'allergies' => $this->allergies,
            'current_medications' => $this->current_medications,
        ];
    }
}
