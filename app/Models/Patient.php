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
        'full_name', // الاسم الثلاثي
        'date_of_birth',
        'age', // العمر (calculated)
        'gender',
        'address', // مكان الإقامة
        'phone', // رقم التواصل
        'email',
        'identity_number', // رقم الإضبارة
        'notes', // ملاحظات إضافية
        'created_by', // Staff who created
        'created_at_staff', // Timestamp when staff created
        'is_active',
    ];

    protected $attributes = [
        'is_active' => true,
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'user_id',
        'created_by',
        'notes', // Hide sensitive notes from unauthorized users
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'age' => 'integer',
            'is_active' => 'boolean',
            'created_at_staff' => 'datetime',
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
     * Get the staff member who created this patient record.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
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
        return $this->hasMany(\App\Models\Prescription::class);
    }

    /**
     * Get the bills for this patient.
     */
    public function bills()
    {
        return $this->hasMany(\App\Models\Bill::class);
    }

    /**
     * Get the patient's age from date of birth.
     */
    public function getAgeAttribute()
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

    /**
     * Generate a unique patient ID.
     */
    public static function generatePatientId()
    {
        do {
            $id = 'PAT-' . str_pad(mt_rand(0, 9999999), 7, '0', STR_PAD_LEFT);
        } while (self::where('patient_id', $id)->exists());

        return $id;
    }

    /**
     * Check if identity number already exists.
     */
    public static function identityNumberExists($identityNumber, $excludeId = null)
    {
        $query = self::where('identity_number', $identityNumber);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        return $query->exists();
    }

    /**
     * Check if phone number already exists.
     */
    public static function phoneNumberExists($phone, $excludeId = null)
    {
        $query = self::where('phone', $phone);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        return $query->exists();
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
            'total_medical_records' => $this->medicalRecords()->count(),
            'total_prescriptions' => $this->prescriptions()->count(),
            'last_visit' => $this->last_visit_date,
            'blood_type' => $this->blood_type,
            'allergies' => $this->allergies,
            'current_medications' => $this->current_medications,
            'medical_conditions' => $this->medical_conditions,
        ];
    }

    /**
     * Scope for patients assigned to a specific doctor via appointments.
     */
    public function scopeAssignedToDoctor($query, $doctorId)
    {
        return $query->whereHas('appointments', function ($q) use ($doctorId) {
            $q->where('doctor_id', $doctorId);
        });
    }

    /**
     * Get patients for a specific doctor.
     */
    public static function getPatientsForDoctor($doctorId)
    {
        return self::assignedToDoctor($doctorId)
            ->with(['user', 'appointments' => function ($query) use ($doctorId) {
                $query->where('doctor_id', $doctorId)
                      ->with(['clinic', 'medicalRecords'])
                      ->latest();
            }])
            ->active()
            ->get();
    }

    /**
     * Scope for active patients.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
