import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Users, Search, Filter, Eye, Calendar, FileText,
    Stethoscope, Activity, Phone, Mail, UserCheck, Clock
} from 'lucide-react';

export default function DoctorPatientsIndex({ patients, filters, stats, auth }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [genderFilter, setGenderFilter] = useState(filters.gender || 'all');
    const [hasRecentVisit, setHasRecentVisit] = useState(filters.has_recent_visit || false);
    const [hasMedicalRecords, setHasMedicalRecords] = useState(filters.has_medical_records || false);

    const patientsArray = Array.isArray(patients) ? patients : (patients?.data ? patients.data : []);

    const filteredPatients = patientsArray.filter(patient => {
        const matchesSearch = !searchTerm ||
            patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone?.includes(searchTerm) ||
            patient.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.identity_number?.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && patient.is_active) ||
            (statusFilter === 'inactive' && !patient.is_active);

        const matchesGender = genderFilter === 'all' || patient.gender === genderFilter;

        return matchesSearch && matchesStatus && matchesGender;
    });

    const getStatusBadge = (patient) => {
        return (
            <Badge className={patient.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {patient.is_active ? 'نشط' : 'غير نشط'}
            </Badge>
        );
    };

    const getLastVisitInfo = (patient) => {
        if (patient.last_visit_date) {
            const lastVisit = new Date(patient.last_visit_date);
            const now = new Date();
            const daysSince = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));

            if (daysSince <= 30) {
                return { text: `منذ ${daysSince} يوم`, color: 'text-green-600' };
            } else if (daysSince <= 90) {
                return { text: `منذ ${Math.floor(daysSince / 30)} شهر`, color: 'text-yellow-600' };
            } else {
                return { text: `منذ ${Math.floor(daysSince / 30)} شهر`, color: 'text-red-600' };
            }
        }
        return { text: 'لم يزر بعد', color: 'text-gray-500' };
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            مرضاي
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            إدارة المرضى المعالجين من قبلي
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="مرضاي" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">إجمالي المرضى</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_patients}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">جديد هذا الشهر</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.new_this_month}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">نشط هذا الشهر</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_patients}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">لديهم سجلات طبية</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.patients_with_records}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center">
                                    <Users className="mr-2 h-5 w-5 text-blue-600" />
                                    جميع المرضى
                                </CardTitle>
                                <CardDescription>
                                    تم العثور على {filteredPatients.length} مريض
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="البحث في المرضى..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع الحالات</SelectItem>
                                    <SelectItem value="active">نشط</SelectItem>
                                    <SelectItem value="inactive">غير نشط</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={genderFilter} onValueChange={setGenderFilter}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع الأجناس</SelectItem>
                                    <SelectItem value="ذكر">ذكر</SelectItem>
                                    <SelectItem value="أنثى">أنثى</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="recent_visit"
                                    checked={hasRecentVisit}
                                    onCheckedChange={setHasRecentVisit}
                                />
                                <label htmlFor="recent_visit" className="text-sm">
                                    زيارات حديثة (3 أشهر)
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="medical_records"
                                    checked={hasMedicalRecords}
                                    onCheckedChange={setHasMedicalRecords}
                                />
                                <label htmlFor="medical_records" className="text-sm">
                                    لديهم سجلات طبية
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Patients Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.map((patient) => {
                        const lastVisitInfo = getLastVisitInfo(patient);
                        return (
                            <Card key={patient.id} className="hover:shadow-lg transition-shadow duration-200">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-blue-700">
                                                    {patient.full_name?.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">
                                                    {patient.full_name}
                                                </CardTitle>
                                                <p className="text-sm text-gray-500">
                                                    {patient.patient_id}
                                                </p>
                                            </div>
                                        </div>
                                        {getStatusBadge(patient)}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {patient.phone}
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="h-4 w-4 mr-2" />
                                        {patient.email || 'لا يوجد بريد إلكتروني'}
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span className={lastVisitInfo.color}>
                                            آخر زيارة: {lastVisitInfo.text}
                                        </span>
                                    </div>

                                    {/* Medical Info */}
                                    {patient.blood_type && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Stethoscope className="h-4 w-4 mr-2" />
                                            فصيلة الدم: {patient.blood_type}
                                        </div>
                                    )}

                                    {/* Appointment Count */}
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Activity className="h-4 w-4 mr-2" />
                                        {patient.total_appointments_with_doctor} موعد معي
                                    </div>

                                    {/* Medical Records Indicator */}
                                    {patient.has_medical_records && (
                                        <div className="flex items-center text-sm text-green-600">
                                            <FileText className="h-4 w-4 mr-2" />
                                            لديه سجلات طبية
                                        </div>
                                    )}

                                    {/* Allergies Warning */}
                                    {patient.allergies && (
                                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                            ⚠️ حساسية: {patient.allergies}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <Link href={route('doctor.patients.show', patient.id)}>
                                            <Button size="sm" variant="outline">
                                                <Eye className="mr-1 h-3 w-3" />
                                                عرض التفاصيل
                                            </Button>
                                        </Link>
                                        <Button size="sm">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            موعد جديد
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filteredPatients.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                لا توجد مرضى
                            </h3>
                            <p className="text-gray-500">
                                {searchTerm ? 'جرب تعديل كلمات البحث.' : 'لم يتم تعيين أي مرضى لك بعد.'}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}