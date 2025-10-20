<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'clinic_id',
        'license_number',
        'specialization',
        'qualification',
        'bio',
        'years_of_experience',
        'consultation_fee',
        'max_patients_per_day',
        'office_phone',
        'office_room',
        'is_available',
        'available_days',
        'start_time',
        'end_time',
    ];

    protected function casts(): array
    {
        return [
            'available_days' => 'array',
            'is_available' => 'boolean',
            'consultation_fee' => 'decimal:2',
            'start_time' => 'datetime:H:i',
            'end_time' => 'datetime:H:i',
        ];
    }

    /**
     * Get the user associated with this doctor.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the clinic this doctor is assigned to.
     */
    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }

    /**
     * Get the patients assigned to this doctor.
     */
    public function patients()
    {
        return $this->hasMany(Patient::class, 'primary_doctor_id');
    }

    /**
     * Get the appointments for this doctor.
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get the medical records created by this doctor.
     */
    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class);
    }

    /**
     * Get the prescriptions written by this doctor.
     */
    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    /**
     * Get the doctor's full name.
     */
    public function getFullNameAttribute()
    {
        return $this->user->name;
    }

    /**
     * Get the doctor's email.
     */
    public function getEmailAttribute()
    {
        return $this->user->email;
    }

    /**
     * Check if doctor is available today.
     */
    public function isAvailableToday()
    {
        $today = now()->format('l'); // Get day name (Monday, Tuesday, etc.)
        $todayLower = strtolower($today);

        return $this->is_available && $this->available_days && in_array($todayLower, $this->available_days);
    }

    /**
     * Check if doctor is available at a specific time.
     */
    public function isAvailableAt($datetime)
    {
        if (!$this->isAvailableToday()) {
            return false;
        }

        $time = $datetime->format('H:i');
        return $time >= $this->start_time->format('H:i') && $time <= $this->end_time->format('H:i');
    }

    /**
     * Get doctor's schedule for a specific day.
     */
    public function getScheduleForDay($day)
    {
        if (!$this->is_available || !$this->available_days || !in_array(strtolower($day), $this->available_days)) {
            return null;
        }

        return [
            'start_time' => $this->start_time->format('H:i'),
            'end_time' => $this->end_time->format('H:i'),
            'consultation_duration' => $this->clinic->consultation_duration_minutes ?? 30,
        ];
    }

    /**
     * Get available appointment slots for a specific date.
     */
    public function getAvailableSlots($date)
    {
        // This would implement the logic to calculate available time slots
        // based on existing appointments and doctor's schedule
        return [];
    }
}
