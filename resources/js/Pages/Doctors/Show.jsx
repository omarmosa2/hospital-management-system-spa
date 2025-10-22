import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    Stethoscope, ArrowLeft, Edit, Phone, Mail, MapPin,
    Clock, Calendar, DollarSign, Award, Users, Activity
} from 'lucide-react';

export default function DoctorsShow({ doctor, can }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-SY', {
            style: 'currency',
            currency: 'SYP'
        }).format(amount);
    };

    const getWorkingDaysText = (workingDays) => {
        if (!Array.isArray(workingDays)) return 'غير محدد';
        const dayNames = {
            'monday': 'الإثنين',
            'tuesday': 'الثلاثاء',
            'wednesday': 'الأربعاء',
            'thursday': 'الخميس',
            'friday': 'الجمعة',
            'saturday': 'السبت',
            'sunday': 'الأحد'
        };
        return workingDays.map(day => dayNames[day] || day).join(', ');
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
                                تفاصيل الطبيب
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                د. {doctor.user?.name}
                            </p>
                        </div>
                    </div>
                    {can.edit && (
                        <Link href={route('doctors.edit', doctor.id)}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                تعديل البيانات
                            </Button>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title={`د. ${doctor.user?.name}`} />

            <div className="space-y-6">
                {/* Doctor Profile Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Stethoscope className="h-10 w-10 text-blue-600" />
                            </div>
                            <div className="flex-1 text-right">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            د. {doctor.user?.name}
                                        </h1>
                                        <p className="text-gray-600 flex items-center">
                                            <Award className="h-4 w-4 ml-2" />
                                            {doctor.specialization}
                                        </p>
                                    </div>
                                    <Badge
                                        className={
                                            doctor.is_available
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }
                                    >
                                        {doctor.is_available ? 'متاح' : 'غير متاح'}
                                    </Badge>
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                    العيادة: {doctor.clinic?.name || 'غير محدد'}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Basic Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Stethoscope className="mr-2 h-5 w-5 text-blue-600" />
                                    المعلومات الأساسية
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">الاسم الكامل</label>
                                        <p className="text-gray-900">{doctor.user?.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
                                        <p className="text-gray-900">{doctor.user?.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                                        <p className="text-gray-900 flex items-center">
                                            <Phone className="h-4 w-4 ml-2 text-gray-400" />
                                            {doctor.phone || 'غير محدد'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">المؤهل العلمي</label>
                                        <p className="text-gray-900">{doctor.qualification}</p>
                                    </div>
                                    <div></div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">العيادة</label>
                                        <p className="text-gray-900">{doctor.clinic?.name || 'غير محدد'}</p>
                                    </div>
                                </div>

                                {doctor.bio && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">نبذة عن الطبيب</label>
                                        <p className="text-gray-900 mt-1">{doctor.bio}</p>
                                    </div>
                                )}
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
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">رقم هاتف العيادة</label>
                                        <p className="text-gray-900 flex items-center">
                                            <Phone className="h-4 w-4 ml-2 text-gray-400" />
                                            {doctor.office_phone || 'غير محدد'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">غرفة العمل</label>
                                        <p className="text-gray-900">{doctor.office_room || 'غير محدد'}</p>
                                    </div>
                                </div>

                                {doctor.address && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">العنوان</label>
                                        <p className="text-gray-900 flex items-center mt-1">
                                            <MapPin className="h-4 w-4 ml-2 text-gray-400" />
                                            {doctor.address}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Schedule Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="mr-2 h-5 w-5 text-orange-600" />
                                    جدول العمل
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-right p-3 font-medium">اليوم</th>
                                                <th className="text-right p-3 font-medium">وقت البداية</th>
                                                <th className="text-right p-3 font-medium">وقت النهاية</th>
                                                <th className="text-right p-3 font-medium">الحالة</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {doctor.schedules && doctor.schedules.map((schedule) => (
                                                <tr key={schedule.day_of_week} className="border-b">
                                                    <td className="p-3 font-medium">{schedule.day_name}</td>
                                                    <td className="p-3">{schedule.is_closed ? '-' : schedule.open_time}</td>
                                                    <td className="p-3">{schedule.is_closed ? '-' : schedule.close_time}</td>
                                                    <td className="p-3">
                                                        {schedule.is_closed ? (
                                                            <Badge variant="secondary">مغلق</Badge>
                                                        ) : (
                                                            <Badge variant="default">مفتوح</Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {doctor.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>ملاحظات</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-900">{doctor.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Financial Information & Stats */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                                    المعلومات المالية
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">أجرة المعاينة</label>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(doctor.consultation_fee)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">نسبة الإجراءات</label>
                                    <p className="text-gray-900">{doctor.procedure_fee_percentage}%</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">نسبة الحسم</label>
                                    <p className="text-gray-900">{doctor.consultation_discount}%</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">نسبة المركز</label>
                                    <p className="text-gray-900">{doctor.center_percentage}%</p>
                                </div>
                                <div></div>
                            </CardContent>
                        </Card>

                        {/* Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Activity className="mr-2 h-5 w-5 text-blue-600" />
                                    الإحصائيات
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">عدد المرضى</label>
                                    <p className="text-2xl font-bold text-blue-600 flex items-center">
                                        <Users className="h-5 w-5 ml-2" />
                                        {doctor.patients?.length || 0}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">تاريخ الإنشاء</label>
                                    <p className="text-gray-900 text-sm">
                                        {new Date(doctor.created_at).toLocaleDateString('ar-SY')}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">آخر تحديث</label>
                                    <p className="text-gray-900 text-sm">
                                        {new Date(doctor.updated_at).toLocaleDateString('ar-SY')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        {can.edit && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>الإجراءات السريعة</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Link href={route('doctors.edit', doctor.id)}>
                                        <Button className="w-full" variant="outline">
                                            <Edit className="mr-2 h-4 w-4" />
                                            تعديل البيانات
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}