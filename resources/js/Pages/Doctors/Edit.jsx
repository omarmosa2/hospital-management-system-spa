import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import InputError from '@/Components/InputError';
import {
    Stethoscope, ArrowLeft, Save, Clock, Calendar,
    Phone, Mail, MapPin, Award, DollarSign
} from 'lucide-react';

export default function DoctorsEdit({ doctor, clinics = [] }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: doctor.user?.name || '',
        email: doctor.user?.email || '',
        phone: doctor.phone || '',
        specialization: doctor.specialization || '',
        qualification: doctor.qualification || '',
        bio: doctor.bio || '',
        consultation_fee: doctor.consultation_fee || '',
        procedure_fee_percentage: doctor.procedure_fee_percentage || '',
        office_phone: doctor.office_phone || '',
        office_room: doctor.office_room || '',
        address: doctor.address || '',
        consultation_discount: doctor.consultation_discount || '',
        center_percentage: doctor.center_percentage || '',
        notes: doctor.notes || '',
        clinic_id: doctor.clinic_id || '',
        is_available: doctor.is_available ?? true,
        schedules: doctor.schedules && doctor.schedules.length > 0 ? doctor.schedules.map(schedule => ({
            id: schedule.id,
            day_of_week: schedule.day_of_week,
            open_time: schedule.is_closed ? '' : schedule.open_time,
            close_time: schedule.is_closed ? '' : schedule.close_time,
            is_closed: schedule.is_closed,
        })) : [
            { day_of_week: 'monday', open_time: '09:00', close_time: '17:00', is_closed: false },
            { day_of_week: 'tuesday', open_time: '09:00', close_time: '17:00', is_closed: false },
            { day_of_week: 'wednesday', open_time: '09:00', close_time: '17:00', is_closed: false },
            { day_of_week: 'thursday', open_time: '09:00', close_time: '17:00', is_closed: false },
            { day_of_week: 'friday', open_time: '09:00', close_time: '17:00', is_closed: false },
            { day_of_week: 'saturday', open_time: '09:00', close_time: '17:00', is_closed: false },
            { day_of_week: 'sunday', open_time: '', close_time: '', is_closed: true },
        ],
    });

    const weekDays = [
        { value: 'monday', label: 'الإثنين' },
        { value: 'tuesday', label: 'الثلاثاء' },
        { value: 'wednesday', label: 'الأربعاء' },
        { value: 'thursday', label: 'الخميس' },
        { value: 'friday', label: 'الجمعة' },
        { value: 'saturday', label: 'السبت' },
        { value: 'sunday', label: 'الأحد' },
    ];

    const specializations = [
        'أسنان', 'جلدية', 'عيون', 'نسائية', 'أطفال', 'عظام',
        'قلب', 'أنف وأذن وحنجرة', 'جراحة', 'طب عام', 'طب نفسي'
    ];

    const handleDayToggle = (day) => {
        const currentDays = data.available_days || [];
        if (currentDays.includes(day)) {
            setData('available_days', currentDays.filter(d => d !== day));
        } else {
            setData('available_days', [...currentDays, day]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('doctors.update', doctor.id), {
            onSuccess: () => {
                // Success handled by redirect
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href={route('doctors.index')}>
                            <Button variant="outline" size="sm" className="mr-4">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                تعديل بيانات الطبيب
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                تعديل بيانات د. {doctor.user?.name}
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`تعديل د. ${doctor.user?.name}`} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Stethoscope className="mr-2 h-5 w-5 text-blue-600" />
                            المعلومات الأساسية
                        </CardTitle>
                        <CardDescription>
                            تعديل المعلومات الشخصية والمهنية للطبيب
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="name">اسم الطبيب الثلاثي *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="أدخل الاسم الثلاثي"
                                    className="text-right"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <Label htmlFor="email">البريد الإلكتروني *</Label>
                                <div className="relative">
                                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="doctor@example.com"
                                        className="pr-10 text-right"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <Label htmlFor="phone">رقم الهاتف *</Label>
                                <div className="relative">
                                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="0999888777"
                                        className="pr-10 text-right"
                                    />
                                </div>
                                <InputError message={errors.phone} />
                            </div>

                            <div></div>

                            <div>
                                <Label htmlFor="specialization">الاختصاص الطبي *</Label>
                                <Select value={data.specialization} onValueChange={(value) => setData('specialization', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر الاختصاص" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {specializations.map(spec => (
                                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.specialization} />
                            </div>

                            <div>
                                <Label htmlFor="qualification">المؤهل العلمي *</Label>
                                <Input
                                    id="qualification"
                                    value={data.qualification}
                                    onChange={(e) => setData('qualification', e.target.value)}
                                    placeholder="مثال: بكالوريوس طب وجراحة"
                                    className="text-right"
                                />
                                <InputError message={errors.qualification} />
                            </div>

                            <div></div>

                            <div>
                                <Label htmlFor="clinic_id">العيادة المرتبطة *</Label>
                                <Select value={data.clinic_id} onValueChange={(value) => setData('clinic_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر العيادة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clinics.map(clinic => (
                                            <SelectItem key={clinic.id} value={clinic.id}>{clinic.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.clinic_id} />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="bio">نبذة عن الطبيب</Label>
                            <Textarea
                                id="bio"
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                                placeholder="اكتب نبذة مختصرة عن الطبيب..."
                                className="text-right"
                                rows={3}
                            />
                            <InputError message={errors.bio} />
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                            المعلومات المالية
                        </CardTitle>
                        <CardDescription>
                            تعديل الأجور والنسب المالية للطبيب
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label htmlFor="consultation_fee">أجرة المعاينة (ل.س) *</Label>
                                <div className="relative">
                                    <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="consultation_fee"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.consultation_fee}
                                        onChange={(e) => setData('consultation_fee', e.target.value)}
                                        placeholder="50000"
                                        className="pr-10"
                                    />
                                </div>
                                <InputError message={errors.consultation_fee} />
                            </div>

                            <div>
                                <Label htmlFor="procedure_fee_percentage">نسبة أجور الإجراءات (%) *</Label>
                                <Input
                                    id="procedure_fee_percentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={data.procedure_fee_percentage}
                                    onChange={(e) => setData('procedure_fee_percentage', e.target.value)}
                                    placeholder="20"
                                />
                                <InputError message={errors.procedure_fee_percentage} />
                            </div>

                            <div>
                                <Label htmlFor="consultation_discount">نسبة الحسم من المعاينات (%) *</Label>
                                <Input
                                    id="consultation_discount"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={data.consultation_discount}
                                    onChange={(e) => setData('consultation_discount', e.target.value)}
                                    placeholder="10"
                                />
                                <InputError message={errors.consultation_discount} />
                            </div>

                            <div>
                                <Label htmlFor="center_percentage">نسبة حسم المركز (%) *</Label>
                                <Input
                                    id="center_percentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={data.center_percentage}
                                    onChange={(e) => setData('center_percentage', e.target.value)}
                                    placeholder="100"
                                />
                                <InputError message={errors.center_percentage} />
                            </div>

                            <div></div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Phone className="mr-2 h-5 w-5 text-purple-600" />
                            معلومات التواصل والموقع
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="office_phone">رقم هاتف العيادة</Label>
                                <div className="relative">
                                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="office_phone"
                                        value={data.office_phone}
                                        onChange={(e) => setData('office_phone', e.target.value)}
                                        placeholder="011223344"
                                        className="pr-10 text-right"
                                    />
                                </div>
                                <InputError message={errors.office_phone} />
                            </div>

                            <div>
                                <Label htmlFor="office_room">غرفة العمل</Label>
                                <Input
                                    id="office_room"
                                    value={data.office_room}
                                    onChange={(e) => setData('office_room', e.target.value)}
                                    placeholder="غرفة 201"
                                    className="text-right"
                                />
                                <InputError message={errors.office_room} />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="address">العنوان</Label>
                            <div className="relative">
                                <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="أدخل العنوان الكامل..."
                                    className="pr-10 text-right"
                                    rows={2}
                                />
                            </div>
                            <InputError message={errors.address} />
                        </div>
                    </CardContent>
                </Card>

                {/* Schedule Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Calendar className="mr-2 h-5 w-5 text-orange-600" />
                            جدول العمل
                        </CardTitle>
                        <CardDescription>
                            تعديل أيام وساعات العمل للطبيب لكل يوم على حدة
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-right p-3 font-medium">اليوم</th>
                                        <th className="text-right p-3 font-medium">وقت البداية</th>
                                        <th className="text-right p-3 font-medium">وقت النهاية</th>
                                        <th className="text-right p-3 font-medium">مغلق</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.schedules.map((schedule, index) => (
                                        <tr key={schedule.day_of_week} className="border-b">
                                            <td className="p-3 font-medium">
                                                {weekDays.find(d => d.value === schedule.day_of_week)?.label}
                                            </td>
                                            <td className="p-3">
                                                <Input
                                                    type="time"
                                                    value={schedule.open_time}
                                                    onChange={(e) => {
                                                        const newSchedules = [...data.schedules];
                                                        newSchedules[index].open_time = e.target.value;
                                                        setData('schedules', newSchedules);
                                                    }}
                                                    disabled={schedule.is_closed}
                                                    className="w-32"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <Input
                                                    type="time"
                                                    value={schedule.close_time}
                                                    onChange={(e) => {
                                                        const newSchedules = [...data.schedules];
                                                        newSchedules[index].close_time = e.target.value;
                                                        setData('schedules', newSchedules);
                                                    }}
                                                    disabled={schedule.is_closed}
                                                    className="w-32"
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <Checkbox
                                                    checked={schedule.is_closed}
                                                    onCheckedChange={(checked) => {
                                                        const newSchedules = [...data.schedules];
                                                        newSchedules[index].is_closed = checked;
                                                        if (checked) {
                                                            newSchedules[index].open_time = '';
                                                            newSchedules[index].close_time = '';
                                                        } else {
                                                            newSchedules[index].open_time = '09:00';
                                                            newSchedules[index].close_time = '17:00';
                                                        }
                                                        setData('schedules', newSchedules);
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <InputError message={errors.schedules} />

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_available"
                                checked={data.is_available}
                                onCheckedChange={(checked) => setData('is_available', checked)}
                            />
                            <Label htmlFor="is_available">الطبيب متاح للحجوزات</Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle>ملاحظات إضافية</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <Label htmlFor="notes">ملاحظات</Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="أي ملاحظات إضافية حول الطبيب..."
                                className="text-right"
                                rows={3}
                            />
                            <InputError message={errors.notes} />
                        </div>
                    </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4">
                    <Link href={route('doctors.index')}>
                        <Button type="button" variant="outline">
                            إلغاء
                        </Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                        <Save className="mr-2 h-4 w-4" />
                        {processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}