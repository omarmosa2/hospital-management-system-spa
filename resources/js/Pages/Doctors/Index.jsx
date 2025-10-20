import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Stethoscope, Search, Plus, Filter, MoreHorizontal, MapPin,
    Phone, Mail, Award, Calendar, Users, Edit, Trash2, Eye
} from 'lucide-react';

export default function DoctorsIndex({ doctors, can }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Ensure doctors is always an array
    const doctorsArray = Array.isArray(doctors) ? doctors : [];

    const filteredDoctors = doctorsArray.filter(doctor =>
        doctor.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getWorkingDaysText = (workingDays) => {
        if (!Array.isArray(workingDays)) return 'Not specified';
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
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            إدارة الأطباء
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            إدارة جميع الأطباء والتخصصات الطبية
                        </p>
                    </div>
                    {can.create && (
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            إضافة طبيب جديد
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="الأطباء" />

            <div className="space-y-6">
                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center">
                                    <Stethoscope className="mr-2 h-5 w-5 text-blue-600" />
                                    جميع الأطباء
                                </CardTitle>
                                <CardDescription>
                                    {filteredDoctors.length} طبيب مسجل في النظام
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="البحث في الأطباء..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-10 text-right"
                                />
                            </div>
                            <Button variant="outline">
                                <Filter className="mr-2 h-4 w-4" />
                                فلترة
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Doctors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
                        <Card key={doctor.id} className="hover:shadow-lg transition-shadow duration-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Stethoscope className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="text-right">
                                            <CardTitle className="text-lg">
                                                د. {doctor.user?.name}
                                            </CardTitle>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Award className="h-3 w-3 ml-1" />
                                                {doctor.specialization}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center text-gray-600">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {doctor.office_phone || 'غير محدد'}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Mail className="h-4 w-4 mr-2" />
                                        {doctor.user?.email}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">رقم الترخيص:</span>
                                        <span className="font-medium">{doctor.license_number}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">سنوات الخبرة:</span>
                                        <span className="font-medium">{doctor.years_of_experience} سنة</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">أيام العمل:</span>
                                        <span className="font-medium text-xs">{getWorkingDaysText(doctor.available_days)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">ساعات العمل:</span>
                                        <span className="font-medium">
                                            {doctor.start_time} - {doctor.end_time}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">عدد المرضى:</span>
                                        <span className="font-medium">
                                            {doctor.patients?.length || 0} مريض
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="flex space-x-2">
                                        <Badge
                                            className={
                                                doctor.user?.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }
                                        >
                                            {doctor.user?.is_active ? 'نشط' : 'معطل'}
                                        </Badge>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="outline">
                                            <Eye className="h-4 w-4 mr-1" />
                                            عرض
                                        </Button>
                                        {can.edit && (
                                            <Button size="sm">
                                                <Edit className="h-4 w-4 mr-1" />
                                                تعديل
                                            </Button>
                                        )}
                                        {can.delete && (
                                            <Button size="sm" variant="destructive">
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                حذف
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredDoctors.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                لا يوجد أطباء
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm ? 'جرب تعديل مصطلحات البحث.' : 'ابدأ بإضافة أول طبيب في النظام.'}
                            </p>
                            {can.create && !searchTerm && (
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    إضافة طبيب جديد
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}