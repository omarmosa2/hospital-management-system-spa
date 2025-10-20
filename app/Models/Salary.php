<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salary extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'base_salary',
        'bonus_amount',
        'deduction_amount',
        'total_salary',
        'salary_period',
        'payment_date',
        'payment_status',
        'notes',
        'salary_components',
    ];

    protected function casts(): array
    {
        return [
            'base_salary' => 'decimal:2',
            'bonus_amount' => 'decimal:2',
            'deduction_amount' => 'decimal:2',
            'total_salary' => 'decimal:2',
            'payment_date' => 'date',
            'salary_components' => 'array',
        ];
    }

    /**
     * Get the doctor that owns this salary record.
     */
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * Check if salary is paid
     */
    public function isPaid()
    {
        return $this->payment_status === 'paid';
    }

    /**
     * Check if salary is pending
     */
    public function isPending()
    {
        return $this->payment_status === 'pending';
    }

    /**
     * Get formatted salary period
     */
    public function getFormattedPeriodAttribute()
    {
        return $this->salary_period;
    }

    /**
     * Get salary status in Arabic
     */
    public function getStatusTextAttribute()
    {
        return match($this->payment_status) {
            'pending' => 'معلق',
            'paid' => 'مدفوع',
            'failed' => 'فشل',
            default => 'غير محدد'
        };
    }
}
