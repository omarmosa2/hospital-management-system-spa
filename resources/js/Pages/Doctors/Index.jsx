import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import Modal from '@/Components/Modal';
import {
    Stethoscope, Search, Plus, Filter, MoreHorizontal,
    Phone, Mail, Award, Calendar, Users, Edit, Trash2,
    Eye, Download, ChevronDown
} from 'lucide-react';

export default function DoctorsIndex({ doctors, can, auth }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [clinicFilter, setClinicFilter] = useState('all');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Ensure doctors is always an array
    const doctorsArray = Array.isArray(doctors) ? doctors : [];

    // Get unique clinics for filter
    const clinics = [...new Set(doctorsArray.map(doctor => doctor.clinic?.name).filter(Boolean))];

    const filteredDoctors = doctorsArray.filter(doctor => {
        const matchesSearch =
            doctor.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.license_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.clinic?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && doctor.is_available) ||
            (statusFilter === 'inactive' && !doctor.is_available);

        const matchesClinic = clinicFilter === 'all' ||
            doctor.clinic?.name === clinicFilter;

        return matchesSearch && matchesStatus && matchesClinic;
    });

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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-SY', {
            style: 'currency',
            currency: 'SYP'
        }).format(amount);
    };

    const handleExport = (format) => {
        // Export functionality would be implemented here
        console.log('Exporting doctors in format:', format);
    };

    const handleDelete = (doctorId) => {
        if (confirm('هل أنت متأكد من حذف هذا الطبيب؟')) {
            router.delete(route('doctors.destroy', doctorId));
        }
    };

    const openDoctorModal = (doctor) => {
        setSelectedDoctor(doctor);
        setShowModal(true);
    };

    const closeDoctorModal = () => {
        setSelectedDoctor(null);
        setShowModal(false);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-darkText leading-tight">
                            إدارة الأطباء
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            إدارة جميع الأطباء والتخصصات الطبية - تحكم كامل
                        </p>
                    </div>
                    {can.create && (
                        <Link href={route('doctors.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                إضافة طبيب جديد
                            </Button>
                        </Link>
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
                                            <Stethoscope className="ml-2 h-5 w-5 text-primary" />
                                            جميع الأطباء
                                        </CardTitle>
                                <CardDescription>
                                    {filteredDoctors.length} طبيب مسجل في النظام - تحكم كامل
                                </CardDescription>
                            </div>
                            {can.create && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleExport('excel')}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    تصدير Excel
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="البحث في الأطباء..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-10 text-right"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="الحالة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع الحالات</SelectItem>
                                    <SelectItem value="active">نشط</SelectItem>
                                    <SelectItem value="inactive">غير نشط</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={clinicFilter} onValueChange={setClinicFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="العيادة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع العيادات</SelectItem>
                                    {clinics.map(clinic => (
                                        <SelectItem key={clinic} value={clinic}>{clinic}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Doctors Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-gray-50">
                                        <TableHead className="text-center font-bold text-darkText p-4">الاسم</TableHead>
                                        <TableHead className="text-center font-bold text-darkText p-4">الاختصاص</TableHead>
                                        <TableHead className="text-center font-bold text-darkText p-4">العيادة</TableHead>
                                        <TableHead className="text-center font-bold text-darkText p-4">رقم الهاتف</TableHead>
                                        <TableHead className="text-center font-bold text-darkText p-4">الحالة</TableHead>
                                        <TableHead className="text-center font-bold text-darkText p-4">أيام العمل</TableHead>
                                        <TableHead className="text-center font-bold text-darkText p-4">آخر تعديل</TableHead>
                                        <TableHead className="text-center font-bold text-darkText p-4">الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDoctors.map((doctor, index) => (
                                        <TableRow key={doctor.id} className="text-center hover:bg-gray-50 transition-colors duration-200">
                                            <TableCell className="font-semibold text-darkText p-4">
                                                د. {doctor.user?.name}
                                            </TableCell>
                                            <TableCell className="text-gray-700 p-4">
                                                <div className="flex items-center justify-center">
                                                    <Award className="h-4 w-4 ml-2 text-primary" />
                                                    {doctor.specialization}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-700 p-4">{doctor.clinic?.name || 'غير محدد'}</TableCell>
                                            <TableCell className="text-gray-700 p-4">
                                                <div className="flex items-center justify-center text-gray-600">
                                                    <Phone className="h-4 w-4 ml-1" />
                                                    {doctor.office_phone || 'غير محدد'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-4">
                                                <Badge
                                                    className={`px-3 py-1 text-xs font-medium ${
                                                        doctor.is_available
                                                            ? 'bg-success/10 text-success border-success/20'
                                                            : 'bg-danger/10 text-danger border-danger/20'
                                                    }`}
                                                >
                                                    {doctor.is_available ? 'فعّال' : 'غير فعّال'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600 p-4">
                                                <div className="space-y-1 max-w-xs">
                                                    {doctor.schedules && doctor.schedules.length > 0 ? (
                                                        <div className="grid grid-cols-1 gap-1">
                                                            {doctor.schedules.map((schedule, idx) => {
                                                                const dayNames = {
                                                                    'monday': 'الإثنين',
                                                                    'tuesday': 'الثلاثاء',
                                                                    'wednesday': 'الأربعاء',
                                                                    'thursday': 'الخميس',
                                                                    'friday': 'الجمعة',
                                                                    'saturday': 'السبت',
                                                                    'sunday': 'الأحد'
                                                                };
                                                                const dayName = dayNames[schedule.day_of_week] || schedule.day_of_week;
                                                                const timeInfo = schedule.is_closed
                                                                    ? 'عطلة'
                                                                    : `${schedule.open_time} - ${schedule.close_time}`;

                                                                return (
                                                                    <div key={schedule.id} className="flex justify-between items-center text-xs bg-gray-50 rounded px-2 py-1">
                                                                        <span className="font-medium text-darkText">{dayName}:</span>
                                                                        <span className={`font-medium ${schedule.is_closed ? 'text-danger' : 'text-success'}`}>
                                                                            {timeInfo}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">غير محدد</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500 p-4">
                                                {new Date(doctor.updated_at).toLocaleDateString('ar-SY')}
                                            </TableCell>
                                            <TableCell className="p-4">
                                                <div className="flex justify-center items-center space-x-2">
                                                    <Button size="sm" variant="outline" className="hover:bg-success/10 hover:border-success/30" onClick={() => openDoctorModal(doctor)}>
                                                        <Eye className="h-4 w-4 text-success" />
                                                    </Button>
                                                    {can.edit && (
                                                        <Link href={route('doctors.edit', doctor.id)}>
                                                            <Button size="sm" variant="outline" className="hover:bg-secondary/10 hover:border-secondary/30">
                                                                <Edit className="h-4 w-4 text-secondary" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {can.delete && (
                                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(doctor.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {filteredDoctors.length === 0 && (
                            <div className="text-center py-12">
                                <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    لا يوجد أطباء
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {searchTerm || statusFilter !== 'all' || clinicFilter !== 'all'
                                        ? 'جرب تعديل معايير البحث أو التصفية.'
                                        : 'ابدأ بإضافة أول طبيب في النظام.'}
                                </p>
                                {can.create && !searchTerm && (
                                    <Link href={route('doctors.create')}>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            إضافة طبيب جديد
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Doctor Details Modal */}
                <Modal show={showModal} onClose={closeDoctorModal}>
                    <div className="p-6">
                        {selectedDoctor && (
                            <>
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                                        <Stethoscope className="h-8 w-8 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">د. {selectedDoctor.user?.name}</h3>
                                        <p className="text-gray-600">{selectedDoctor.specialization}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium mb-4">المعلومات الأساسية</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">رقم الترخيص:</span>
                                                <span>{selectedDoctor.license_number}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">سنوات الخبرة:</span>
                                                <span>{selectedDoctor.years_of_experience} سنة</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">أجرة المعاينة:</span>
                                                <span>{formatCurrency(selectedDoctor.consultation_fee)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">نسبة الإجراءات:</span>
                                                <span>{selectedDoctor.procedure_fee_percentage}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">نسبة الحسم:</span>
                                                <span>{selectedDoctor.consultation_discount}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">نسبة المركز:</span>
                                                <span>{selectedDoctor.center_percentage}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-4">معلومات التواصل والعمل</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">البريد الإلكتروني:</span>
                                                <span className="text-sm">{selectedDoctor.user?.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">رقم الهاتف:</span>
                                                <span>{selectedDoctor.office_phone || 'غير محدد'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">غرفة العمل:</span>
                                                <span>{selectedDoctor.office_room || 'غير محدد'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">العيادة:</span>
                                                <span>{selectedDoctor.clinic?.name || 'غير محدد'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">ساعات العمل:</span>
                                                <span>{selectedDoctor.start_time} - {selectedDoctor.end_time}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">أيام العمل:</span>
                                                <span className="text-sm">{getWorkingDaysText(selectedDoctor.available_days)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedDoctor.address && (
                                    <div className="mt-6">
                                        <h4 className="font-medium mb-2">العنوان</h4>
                                        <p className="text-gray-700">{selectedDoctor.address}</p>
                                    </div>
                                )}

                                {selectedDoctor.bio && (
                                    <div className="mt-6">
                                        <h4 className="font-medium mb-2">نبذة عن الطبيب</h4>
                                        <p className="text-gray-700">{selectedDoctor.bio}</p>
                                    </div>
                                )}

                                {selectedDoctor.notes && (
                                    <div className="mt-6">
                                        <h4 className="font-medium mb-2">ملاحظات</h4>
                                        <p className="text-gray-700">{selectedDoctor.notes}</p>
                                    </div>
                                )}

                                <div className="flex justify-end mt-6 pt-4 border-t">
                                    <Button onClick={closeDoctorModal}>
                                        إغلاق
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}