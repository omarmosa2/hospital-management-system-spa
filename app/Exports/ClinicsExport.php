<?php

namespace App\Exports;

use App\Models\Clinic;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ClinicsExport implements FromCollection, WithHeadings, WithMapping
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return Clinic::with(['headDoctor.user', 'doctors.user'])
                     ->withCount(['doctors', 'appointments' => function($query) {
                         $query->where('status', 'confirmed');
                     }])
                     ->orderBy('name')
                     ->get();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'اسم العيادة',
            'التخصص',
            'الوصف',
            'الموقع',
            'الهاتف',
            'البريد الإلكتروني',
            'ساعات العمل',
            'أيام العمل',
            'الحالة',
            'عدد الأطباء',
            'عدد المواعيد',
            'رئيس الأطباء',
            'تاريخ الإنشاء',
            'آخر تحديث',
        ];
    }

    /**
     * @param mixed $clinic
     * @return array
     */
    public function map($clinic): array
    {
        $workingDays = is_array($clinic->working_days) ? implode(', ', array_map(function($day) {
            $days = [
                'monday' => 'الإثنين',
                'tuesday' => 'الثلاثاء',
                'wednesday' => 'الأربعاء',
                'thursday' => 'الخميس',
                'friday' => 'الجمعة',
                'saturday' => 'السبت',
                'sunday' => 'الأحد',
            ];
            return $days[$day] ?? $day;
        }, $clinic->working_days)) : 'غير محدد';

        return [
            $clinic->name,
            $clinic->specialty ?? 'غير محدد',
            $clinic->description ?? '',
            $clinic->location ?? '',
            $clinic->phone ?? '',
            $clinic->email ?? '',
            $clinic->start_time && $clinic->end_time ? $clinic->start_time . ' - ' . $clinic->end_time : '',
            $workingDays,
            $clinic->is_active ? 'فعالة' : 'غير فعالة',
            $clinic->doctors_count,
            $clinic->appointments_count,
            $clinic->headDoctor ? $clinic->headDoctor->user->name : '',
            $clinic->created_at ? $clinic->created_at->format('Y-m-d H:i:s') : '',
            $clinic->updated_at ? $clinic->updated_at->format('Y-m-d H:i:s') : '',
        ];
    }
}