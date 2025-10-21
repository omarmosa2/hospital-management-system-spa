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
        'visit_type',
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
        // الحقول المالية الجديدة
        'base_consultation_fee',
        'amount_received',
        'center_discount',
        'doctor_discount',
        'additional_procedures_amount',
        'additional_procedures',
        'doctor_consultation_fee',
        'center_consultation_fee',
        'doctor_procedures_fee',
        'center_procedures_fee',
        'total_doctor_fee',
        'total_center_fee',
        'is_first_visit_free',
        'advance_payment',
        'remaining_amount',
        'payment_status',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_datetime' => 'datetime',
            'end_datetime' => 'datetime',
            'checked_in_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            // تحويل الحقول المالية إلى أرقام عشرية
            'base_consultation_fee' => 'decimal:2',
            'amount_received' => 'decimal:2',
            'center_discount' => 'decimal:2',
            'doctor_discount' => 'decimal:2',
            'additional_procedures_amount' => 'decimal:2',
            'doctor_consultation_fee' => 'decimal:2',
            'center_consultation_fee' => 'decimal:2',
            'doctor_procedures_fee' => 'decimal:2',
            'center_procedures_fee' => 'decimal:2',
            'total_doctor_fee' => 'decimal:2',
            'total_center_fee' => 'decimal:2',
            'advance_payment' => 'decimal:2',
            'remaining_amount' => 'decimal:2',
            'is_first_visit_free' => 'boolean',
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

    /**
     * حساب أجور الطبيب من المعاينة بعد الخصم
     */
    public function calculateDoctorConsultationFee(): float
    {
        if ($this->is_first_visit_free) {
            return 0;
        }

        $baseFee = $this->base_consultation_fee;
        $doctorDiscount = $this->doctor_discount;

        return max(0, $baseFee - $doctorDiscount);
    }

    /**
     * حساب أجور المركز من المعاينة بعد الخصم
     */
    public function calculateCenterConsultationFee(): float
    {
        if ($this->is_first_visit_free) {
            return 0;
        }

        $baseFee = $this->base_consultation_fee;
        $centerDiscount = $this->center_discount;

        return max(0, $baseFee - $centerDiscount);
    }

    /**
     * حساب إجمالي أجور الطبيب (معاينة + إجراءات)
     */
    public function calculateTotalDoctorFee(): float
    {
        return $this->doctor_consultation_fee + $this->doctor_procedures_fee;
    }

    /**
     * حساب إجمالي أجور المركز (معاينة + إجراءات)
     */
    public function calculateTotalCenterFee(): float
    {
        return $this->center_consultation_fee + $this->center_procedures_fee;
    }

    /**
     * حساب المبلغ المتبقي للدفع
     */
    public function calculateRemainingAmount(): float
    {
        $totalAmount = $this->amount_received;
        return max(0, $totalAmount - $this->advance_payment);
    }

    /**
     * التحقق من حالة الدفع
     */
    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    /**
     * التحقق من وجود دفعة جزئية
     */
    public function isPartiallyPaid(): bool
    {
        return $this->payment_status === 'partial';
    }

    /**
     * التحقق من كون الزيارة مراجعة
     */
    public function isFollowUp(): bool
    {
        return $this->visit_type === 'follow_up';
    }

    /**
     * التحقق من كون الزيارة معاينة أولى
     */
    public function isConsultation(): bool
    {
        return $this->visit_type === 'consultation';
    }

    /**
     * حساب المبلغ الإجمالي للفاتورة
     */
    public function calculateTotalAmount(): float
    {
        return $this->base_consultation_fee + $this->additional_procedures_amount;
    }

    /**
     * حساب نسبة الخصم من المركز
     */
    public function calculateCenterDiscountPercentage(): float
    {
        if ($this->base_consultation_fee <= 0) {
            return 0;
        }

        return ($this->center_discount / $this->base_consultation_fee) * 100;
    }

    /**
     * حساب نسبة خصم الطبيب
     */
    public function calculateDoctorDiscountPercentage(): float
    {
        if ($this->base_consultation_fee <= 0) {
            return 0;
        }

        return ($this->doctor_discount / $this->base_consultation_fee) * 100;
    }

    /**
     * حساب أجور الطبيب من الإجراءات الإضافية
     */
    public function calculateDoctorProcedureFee(): float
    {
        if (!$this->doctor || $this->doctor->procedure_fee_percentage <= 0) {
            return 0;
        }

        return ($this->additional_procedures_amount * $this->doctor->procedure_fee_percentage) / 100;
    }

    /**
     * حساب أجور المركز من الإجراءات الإضافية
     */
    public function calculateCenterProcedureFee(): float
    {
        $totalProcedureAmount = $this->additional_procedures_amount;
        $doctorProcedureFee = $this->calculateDoctorProcedureFee();

        return $totalProcedureAmount - $doctorProcedureFee;
    }

    /**
     * حساب إجمالي المبلغ المستحق للطبيب
     */
    public function calculateTotalAmountForDoctor(): float
    {
        return $this->doctor_consultation_fee + $this->doctor_procedures_fee;
    }

    /**
     * حساب إجمالي المبلغ المستحق للمركز
     */
    public function calculateTotalAmountForCenter(): float
    {
        return $this->center_consultation_fee + $this->center_procedures_fee;
    }

    /**
     * تحديث الحسابات المالية تلقائيًا
     */
    public function updateFinancialCalculations(): void
    {
        $this->update([
            'doctor_consultation_fee' => $this->calculateDoctorConsultationFee(),
            'center_consultation_fee' => $this->calculateCenterConsultationFee(),
            'doctor_procedures_fee' => $this->calculateDoctorProcedureFee(),
            'center_procedures_fee' => $this->calculateCenterProcedureFee(),
            'total_doctor_fee' => $this->calculateTotalAmountForDoctor(),
            'total_center_fee' => $this->calculateTotalAmountForCenter(),
            'remaining_amount' => $this->calculateRemainingAmount(),
        ]);
    }

    /**
     * حفظ الموعد مع تحديث الحسابات المالية
     */
    public function saveWithFinancialCalculations(array $options = []): bool
    {
        if ($this->save($options)) {
            $this->updateFinancialCalculations();
            return true;
        }

        return false;
    }
}
