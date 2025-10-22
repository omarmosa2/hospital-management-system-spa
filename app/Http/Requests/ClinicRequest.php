<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClinicRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled in the controller
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $clinicId = $this->route('clinic') ? $this->route('clinic')->id : null;

        return [
            'name' => 'required|string|max:255',
            'specialty' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => [
                'nullable',
                'email',
                'unique:clinics,email,' . $clinicId,
            ],
            'schedules' => 'nullable|array',
            'schedules.*.day_of_week' => 'required_with:schedules|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'schedules.*.open_time' => 'required_with:schedules|date_format:H:i',
            'schedules.*.close_time' => 'required_with:schedules|date_format:H:i|after:schedules.*.open_time',
            'schedules.*.is_closed' => 'nullable|boolean',
            'max_patients_per_day' => 'nullable|integer|min:1|max:200',
            'consultation_duration_minutes' => 'nullable|integer|min:5|max:120',
            'is_active' => 'nullable|boolean',
            'color' => 'nullable|string',
            'head_doctor_id' => 'nullable|exists:users,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'اسم العيادة مطلوب.',
            'name.max' => 'اسم العيادة يجب ألا يزيد عن 255 حرفاً.',
            'specialty.max' => 'التخصص يجب ألا يزيد عن 255 حرفاً.',
            'location.max' => 'الموقع يجب ألا يزيد عن 255 حرفاً.',
            'phone.max' => 'رقم الهاتف يجب ألا يزيد عن 20 حرفاً.',
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'email.unique' => 'البريد الإلكتروني مستخدم من قبل.',
            'start_time.required' => 'وقت البداية مطلوب.',
            'schedules.array' => 'جدول أوقات العمل يجب أن يكون قائمة.',
            'schedules.*.day_of_week.required_with' => 'يوم الأسبوع مطلوب.',
            'schedules.*.day_of_week.in' => 'يوم الأسبوع غير صالح.',
            'schedules.*.open_time.required_with' => 'وقت البداية مطلوب.',
            'schedules.*.open_time.date_format' => 'وقت البداية يجب أن يكون بتنسيق صحيح.',
            'schedules.*.close_time.required_with' => 'وقت النهاية مطلوب.',
            'schedules.*.close_time.date_format' => 'وقت النهاية يجب أن يكون بتنسيق صحيح.',
            'schedules.*.close_time.after' => 'وقت النهاية يجب أن يكون بعد وقت البداية.',
            'schedules.*.is_closed.boolean' => 'حالة الإغلاق يجب أن تكون صحيحة أو خاطئة.',
            'max_patients_per_day.integer' => 'الحد الأقصى للمرضى يجب أن يكون رقماً صحيحاً.',
            'max_patients_per_day.min' => 'الحد الأقصى للمرضى يجب ألا يقل عن 1.',
            'max_patients_per_day.max' => 'الحد الأقصى للمرضى يجب ألا يزيد عن 200.',
            'consultation_duration_minutes.integer' => 'مدة الاستشارة يجب أن تكون رقماً صحيحاً.',
            'consultation_duration_minutes.min' => 'مدة الاستشارة يجب ألا تقل عن 5 دقائق.',
            'consultation_duration_minutes.max' => 'مدة الاستشارة يجب ألا تزيد عن 120 دقيقة.',
            'is_active.boolean' => 'حالة العيادة يجب أن تكون صحيحة أو خاطئة.',
            'head_doctor_id.exists' => 'الطبيب المختار غير موجود.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'اسم العيادة',
            'specialty' => 'التخصص',
            'description' => 'الوصف',
            'location' => 'الموقع',
            'phone' => 'الهاتف',
            'email' => 'البريد الإلكتروني',
            'schedules' => 'جدول أوقات العمل',
            'schedules.*.day_of_week' => 'يوم الأسبوع',
            'schedules.*.open_time' => 'وقت البداية',
            'schedules.*.close_time' => 'وقت النهاية',
            'schedules.*.is_closed' => 'حالة الإغلاق',
            'max_patients_per_day' => 'الحد الأقصى للمرضى يومياً',
            'consultation_duration_minutes' => 'مدة الاستشارة بالدقائق',
            'is_active' => 'الحالة',
            'head_doctor_id' => 'رئيس الأطباء',
        ];
    }
}