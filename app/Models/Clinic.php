<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Clinic extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'location',
        'phone',
        'email',
        'start_time',
        'end_time',
        'working_days',
        'max_patients_per_day',
        'consultation_duration_minutes',
        'is_active',
        'head_doctor_id',
    ];

    protected function casts(): array
    {
        return [
            'working_days' => 'array',
            'is_active' => 'boolean',
            'start_time' => 'datetime:H:i',
            'end_time' => 'datetime:H:i',
        ];
    }

    /**
     * Get the head doctor for this clinic.
     */
    public function headDoctor()
    {
        return $this->belongsTo(User::class, 'head_doctor_id');
    }

    /**
     * Get the doctors assigned to this clinic.
     */
    public function doctors()
    {
        return $this->hasMany(Doctor::class);
    }

    /**
     * Get the patients who prefer this clinic.
     */
    public function preferredPatients()
    {
        return $this->hasMany(Patient::class, 'preferred_clinic_id');
    }

    /**
     * Get the appointments for this clinic.
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get the medical records created in this clinic.
     */
    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class);
    }

    /**
     * Check if clinic is currently active.
     */
    public function isActive()
    {
        return $this->is_active;
    }

    /**
     * Check if clinic is open on a specific day.
     */
    public function isOpenOn(string $day)
    {
        return $this->working_days && in_array($day, $this->working_days);
    }

    /**
     * Get clinic working hours as formatted string.
     */
    public function getWorkingHoursAttribute()
    {
        if (!$this->working_days) {
            return 'Not specified';
        }

        $days = implode(', ', $this->working_days);
        return "{$days}: {$this->start_time->format('H:i')} - {$this->end_time->format('H:i')}";
    }

    /**
     * Get available appointment slots for a specific date.
     */
    public function getAvailableSlots($date)
    {
        // This would implement the logic to calculate available time slots
        // based on existing appointments and clinic capacity
        return [];
    }
}
