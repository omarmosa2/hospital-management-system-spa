<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bill extends Model
{
    use HasFactory;

    protected $fillable = [
        'bill_number',
        'patient_id',
        'appointment_id',
        'bill_date',
        'due_date',
        'bill_type',
        'status',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'paid_amount',
        'remaining_amount',
        'paid_at',
        'payment_method',
        'payment_reference',
        'is_insurance_claim',
        'insurance_company',
        'policy_number',
        'insurance_coverage',
        'patient_responsibility',
        'created_by',
        'notes',
        'cancellation_reason',
        'cancelled_at',
    ];

    protected $casts = [
        'bill_date' => 'date',
        'due_date' => 'date',
        'paid_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'is_insurance_claim' => 'boolean',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'insurance_coverage' => 'decimal:2',
        'patient_responsibility' => 'decimal:2',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}