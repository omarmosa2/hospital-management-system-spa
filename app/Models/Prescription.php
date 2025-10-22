<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'prescription_number',
        'patient_id',
        'doctor_id',
        'medical_record_id',
        'appointment_id',
        'medication_name',
        'generic_name',
        'brand_name',
        'medication_type',
        'dosage',
        'frequency',
        'duration_days',
        'quantity',
        'instructions',
        'special_instructions',
        'is_prn',
        'start_date',
        'end_date',
        'status',
        'refills_allowed',
        'refills_remaining',
        'pharmacy_name',
        'pharmacy_notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_prn' => 'boolean',
        'refills_allowed' => 'boolean',
        'duration_days' => 'integer',
        'quantity' => 'integer',
        'refills_remaining' => 'integer',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}