<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DoctorSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'day_of_week',
        'open_time',
        'close_time',
        'is_closed',
    ];

    protected function casts(): array
    {
        return [
            'open_time' => 'datetime:H:i',
            'close_time' => 'datetime:H:i',
            'is_closed' => 'boolean',
        ];
    }

    /**
     * Get the doctor that owns this schedule.
     */
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * Get day name in Arabic.
     */
    public function getDayNameArAttribute()
    {
        $days = [
            'monday' => 'الإثنين',
            'tuesday' => 'الثلاثاء',
            'wednesday' => 'الأربعاء',
            'thursday' => 'الخميس',
            'friday' => 'الجمعة',
            'saturday' => 'السبت',
            'sunday' => 'الأحد',
        ];

        return $days[$this->day_of_week] ?? $this->day_of_week;
    }
}
