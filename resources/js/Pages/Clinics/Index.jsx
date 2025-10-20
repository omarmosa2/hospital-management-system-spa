import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Building2, Search, Plus, Filter, MoreHorizontal, MapPin,
    Phone, Mail, Clock, Users, Edit, Trash2, Eye
} from 'lucide-react';

export default function ClinicsIndex({ clinics, auth }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Ensure clinics is always an array
    const clinicsArray = Array.isArray(clinics) ? clinics : [];

    // Role-based permissions
    const userRole = auth.user.role;
    const canCreateClinics = userRole === 'admin';
    const canEditClinics = userRole === 'admin';
    const canDeleteClinics = userRole === 'admin';
    const isReadOnly = userRole === 'reception';
    const showPageForDoctor = userRole !== 'doctor';

    // If doctor tries to access this page, show access denied
    if (!showPageForDoctor) {
        return (
            <AuthenticatedLayout
                header={
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                Access Denied
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                You don't have permission to access this page
                            </p>
                        </div>
                    </div>
                }
            >
                <Head title="Access Denied" />
                <Card>
                    <CardContent className="text-center py-12">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Access Restricted
                        </h3>
                        <p className="text-gray-500">
                            Doctors do not have access to clinic management pages.
                        </p>
                    </CardContent>
                </Card>
            </AuthenticatedLayout>
        );
    }

    const filteredClinics = clinicsArray.filter(clinic =>
        clinic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.phone?.includes(searchTerm)
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
                            إدارة العيادات
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {isReadOnly ? 'عرض العيادات المتاحة (صلاحيات القراءة فقط)' : 'إدارة جميع العيادات والخدمات الطبية'}
                        </p>
                    </div>
                    {canCreateClinics && (
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            إضافة عيادة جديدة
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="العيادات" />

            <div className="space-y-6">
                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center">
                                    <Building2 className="mr-2 h-5 w-5 text-blue-600" />
                                    جميع العيادات
                                </CardTitle>
                                <CardDescription>
                                    {filteredClinics.length} عيادة موجودة في النظام {isReadOnly && '- صلاحيات القراءة فقط'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="البحث في العيادات..."
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

                {/* Clinics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClinics.map((clinic) => (
                        <Card key={clinic.id} className="hover:shadow-lg transition-shadow duration-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Building2 className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="text-right">
                                            <CardTitle className="text-lg">
                                                {clinic.name}
                                            </CardTitle>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <MapPin className="h-3 w-3 ml-1" />
                                                {clinic.location}
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
                                        {clinic.phone}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Mail className="h-4 w-4 mr-2" />
                                        {clinic.email}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">أيام العمل:</span>
                                        <span className="font-medium">{getWorkingDaysText(clinic.working_days)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">ساعات العمل:</span>
                                        <span className="font-medium">
                                            {clinic.start_time} - {clinic.end_time}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">عدد الأطباء:</span>
                                        <span className="font-medium">
                                            {clinic.doctors?.length || 0} طبيب
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="flex space-x-2">
                                        <Badge
                                            className={
                                                clinic.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }
                                        >
                                            {clinic.is_active ? 'نشطة' : 'معطلة'}
                                        </Badge>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="outline">
                                            <Eye className="h-4 w-4 mr-1" />
                                            عرض
                                        </Button>
                                        {canEditClinics && (
                                            <Button size="sm">
                                                <Edit className="h-4 w-4 mr-1" />
                                                تعديل
                                            </Button>
                                        )}
                                        {canDeleteClinics && (
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

                {filteredClinics.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                لا توجد عيادات
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm ? 'جرب تعديل مصطلحات البحث.' : isReadOnly ? 'لا توجد عيادات في النظام بعد.' : 'ابدأ بإضافة أول عيادة في النظام.'}
                            </p>
                            {canCreateClinics && !searchTerm && (
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    إضافة عيادة جديدة
                                </Button>
                            )}
                            {isReadOnly && !searchTerm && (
                                <Badge variant="outline">العيادات مُدارة من قبل المسؤولين</Badge>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}