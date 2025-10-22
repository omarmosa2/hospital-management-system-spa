import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import toast, { Toaster } from 'react-hot-toast';
import {
    Building2, Search, Plus, Filter, MoreHorizontal, MapPin,
    Phone, Mail, Clock, Users, Edit, Trash2, Eye, FileDown,
    Calendar, CheckCircle, XCircle, Palette, Loader2
} from 'lucide-react';

export default function ClinicsIndex({ clinics, stats, can, auth }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editingClinic, setEditingClinic] = useState(null);
    const [deletingClinic, setDeletingClinic] = useState(null);
    const [selectedClinic, setSelectedClinic] = useState(null);

    // Form for creating/editing clinics with validation
    const createForm = useForm({
        name: '',
        specialty: '',
        description: '',
        location: '',
        phone: '',
        email: '',
        schedules: [
            { day_of_week: 'saturday', open_time: '08:00', close_time: '18:00', is_closed: false },
            { day_of_week: 'sunday', open_time: '08:00', close_time: '18:00', is_closed: false },
            { day_of_week: 'monday', open_time: '08:00', close_time: '18:00', is_closed: false },
            { day_of_week: 'tuesday', open_time: '08:00', close_time: '18:00', is_closed: false },
            { day_of_week: 'wednesday', open_time: '08:00', close_time: '18:00', is_closed: false },
            { day_of_week: 'thursday', open_time: '08:00', close_time: '18:00', is_closed: false },
            { day_of_week: 'friday', open_time: '08:00', close_time: '18:00', is_closed: false },
        ],
        max_patients_per_day: 50,
        consultation_duration_minutes: 30,
        is_active: true,
        head_doctor_id: '',
    });

    // Validation function
    const validateForm = (data) => {
        const errors = {};

        if (!data.name.trim()) {
            errors.name = 'اسم العيادة مطلوب';
        }

        // Validate schedules
        if (!data.schedules || !Array.isArray(data.schedules) || data.schedules.length === 0) {
            errors.schedules = 'يجب إضافة جدول دوام واحد على الأقل';
        } else {
            data.schedules.forEach((schedule, index) => {
                if (!schedule.day_of_week) {
                    errors[`schedules.${index}.day_of_week`] = 'يوم الأسبوع مطلوب';
                }
                if (!schedule.open_time) {
                    errors[`schedules.${index}.open_time`] = 'وقت البداية مطلوب';
                }
                if (!schedule.close_time) {
                    errors[`schedules.${index}.close_time`] = 'وقت النهاية مطلوب';
                }
                if (schedule.open_time && schedule.close_time && schedule.open_time >= schedule.close_time) {
                    errors[`schedules.${index}.close_time`] = 'وقت النهاية يجب أن يكون بعد وقت البداية';
                }
            });
        }

        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = 'البريد الإلكتروني غير صالح';
        }

        return errors;
    };

    // Helper function to get day names
    const getDayName = (day) => {
        const dayNames = {
            saturday: 'السبت',
            sunday: 'الأحد',
            monday: 'الإثنين',
            tuesday: 'الثلاثاء',
            wednesday: 'الأربعاء',
            thursday: 'الخميس',
            friday: 'الجمعة'
        };
        return dayNames[day] || day;
    };

    const editForm = useForm({
        name: '',
        specialty: '',
        description: '',
        location: '',
        phone: '',
        email: '',
        schedules: [],
        max_patients_per_day: '',
        consultation_duration_minutes: '',
        is_active: true,
        head_doctor_id: '',
    });

    // Ensure clinics is always an array
    const clinicsArray = Array.isArray(clinics) ? clinics : [];

    // Role-based permissions from backend
    const canCreateClinics = can.create;
    const canEditClinics = can.edit;
    const canDeleteClinics = can.delete;
    const canExport = can.export;
    const userRole = auth.user.role?.name;
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

    // Get unique specialties for filter dropdown
    const specialties = [...new Set(clinicsArray.map(clinic => clinic.specialty).filter(Boolean))];

    const filteredClinics = clinicsArray.filter(clinic => {
        const matchesSearch = clinic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            clinic.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            clinic.phone?.includes(searchTerm) ||
                            clinic.specialty?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSpecialty = !specialtyFilter || clinic.specialty === specialtyFilter;

        const matchesStatus = !statusFilter ||
                            (statusFilter === 'active' && clinic.is_active) ||
                            (statusFilter === 'inactive' && !clinic.is_active);

        return matchesSearch && matchesSpecialty && matchesStatus;
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

    // Handle form submissions with enhanced UX
    const handleCreate = (e) => {
        e.preventDefault();

        // Custom validation
        const validationErrors = validateForm(createForm.data);
        if (Object.keys(validationErrors).length > 0) {
            createForm.setError(validationErrors);
            toast.error('يرجى تصحيح الأخطاء في النموذج');
            return;
        }

        // Transform schedules to match backend expectations
        const formData = { ...createForm.data };

        // Set default values for required fields
        formData.max_patients_per_day = formData.max_patients_per_day || 50;
        formData.consultation_duration_minutes = formData.consultation_duration_minutes || 30;
        formData.is_active = formData.is_active !== undefined ? formData.is_active : true;

        // Ensure CSRF token is included
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const headers = {};
        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        }

        createForm.post(route('clinics.store'), {
            data: formData,
            headers: headers,
            onSuccess: () => {
                toast.success('تم إضافة العيادة بنجاح! 🎉');
                setShowCreateModal(false);
                createForm.reset();
                // Refresh the page to show updated data
                window.location.reload();
            },
            onError: (errors) => {
                toast.error('حدث خطأ أثناء إضافة العيادة');
                console.error('Form errors:', errors);
            },
        });
    };

    const handleEdit = (clinic) => {
        // Initialize schedules from clinic data
        let schedules = [];
        if (clinic.schedules && Array.isArray(clinic.schedules)) {
            schedules = clinic.schedules.map(schedule => ({
                day_of_week: schedule.day_of_week,
                open_time: schedule.open_time,
                close_time: schedule.close_time,
                is_closed: schedule.is_closed
            }));
        }

        // If no schedules, create default ones
        if (schedules.length === 0) {
            schedules = [
                { day_of_week: 'saturday', open_time: '08:00', close_time: '18:00', is_closed: false },
                { day_of_week: 'sunday', open_time: '08:00', close_time: '18:00', is_closed: false },
                { day_of_week: 'monday', open_time: '08:00', close_time: '18:00', is_closed: false },
                { day_of_week: 'tuesday', open_time: '08:00', close_time: '18:00', is_closed: false },
                { day_of_week: 'wednesday', open_time: '08:00', close_time: '18:00', is_closed: false },
                { day_of_week: 'thursday', open_time: '08:00', close_time: '18:00', is_closed: false },
                { day_of_week: 'friday', open_time: '08:00', close_time: '18:00', is_closed: false },
            ];
        }

        editForm.setData({
            name: clinic.name,
            specialty: clinic.specialty || '',
            description: clinic.description || '',
            location: clinic.location || '',
            phone: clinic.phone || '',
            email: clinic.email || '',
            schedules: schedules,
            max_patients_per_day: clinic.max_patients_per_day || 50,
            consultation_duration_minutes: clinic.consultation_duration_minutes || 30,
            is_active: clinic.is_active,
            head_doctor_id: '',
        });
        setEditingClinic(clinic);
        setShowEditModal(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();

        const validationErrors = validateForm(editForm.data);
        if (Object.keys(validationErrors).length > 0) {
            editForm.setError(validationErrors);
            toast.error('يرجى تصحيح الأخطاء في النموذج');
            return;
        }

        // Transform schedules to match backend expectations
        const formData = { ...editForm.data };

        // Set default values for required fields
        formData.max_patients_per_day = formData.max_patients_per_day || 50;
        formData.consultation_duration_minutes = formData.consultation_duration_minutes || 30;
        formData.is_active = formData.is_active !== undefined ? formData.is_active : true;

        // Ensure CSRF token is included
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const headers = {};
        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        }

        editForm.put(route('clinics.update', editingClinic.id), {
            data: formData,
            headers: headers,
            onSuccess: () => {
                toast.success('تم تحديث العيادة بنجاح! ✅');
                setShowEditModal(false);
                setEditingClinic(null);
                window.location.reload();
            },
            onError: (errors) => {
                toast.error('حدث خطأ أثناء تحديث العيادة');
                console.error('Form errors:', errors);
            },
        });
    };

    const handleDelete = (clinic) => {
        setDeletingClinic(clinic);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(route('clinics.destroy', deletingClinic.id), {
            onSuccess: () => {
                toast.success('تم حذف العيادة بنجاح! 🗑️');
                setShowDeleteModal(false);
                setDeletingClinic(null);
                window.location.reload();
            },
            onError: (errors) => {
                toast.error('حدث خطأ أثناء حذف العيادة');
                console.error('Delete errors:', errors);
            },
        });
    };

    const handleViewDetails = (clinic) => {
        setSelectedClinic(clinic);
        setShowDetailsModal(true);
    };

    const handleExport = () => {
        window.open(route('clinics.export'), '_blank');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-darkText leading-tight">
                            إدارة العيادات
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {isReadOnly ? 'عرض العيادات المتاحة (صلاحيات القراءة فقط)' : 'إدارة جميع العيادات والخدمات الطبية - تحكم كامل'}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        {canExport && (
                            <Button variant="outline" onClick={handleExport}>
                                <FileDown className="mr-2 h-4 w-4" />
                                تصدير
                            </Button>
                        )}
                        {canCreateClinics && (
                            <Button onClick={() => setShowCreateModal(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                إضافة عيادة جديدة
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="العيادات" />

            <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-darkText">إجمالي العيادات</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_clinics || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-darkText">العيادات الفعالة</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.total_active_clinics || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-darkText">العيادات غير الفعالة</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.total_inactive_clinics || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-darkText">إجمالي الأطباء</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_doctors || 0}</div>
                        </CardContent>
                    </Card>
                </div>
                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center">
                                            <Building2 className="ml-2 h-5 w-5 text-primary" />
                                            جميع العيادات
                                        </CardTitle>
                                <CardDescription>
                                    {filteredClinics.length} عيادة موجودة في النظام {isReadOnly ? '- صلاحيات القراءة فقط' : '- تحكم كامل'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="البحث في العيادات..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-10 text-right"
                                />
                            </div>

                            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="التخصص" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">جميع التخصصات</SelectItem>
                                    {specialties.map(specialty => (
                                        <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="الحالة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">جميع الحالات</SelectItem>
                                    <SelectItem value="active">فعالة</SelectItem>
                                    <SelectItem value="inactive">غير فعالة</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="outline" onClick={() => { setSearchTerm(''); setSpecialtyFilter(''); setStatusFilter(''); }}>
                                إعادة تعيين
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Clinics Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">اسم العيادة</TableHead>
                                    <TableHead className="text-right">التخصص</TableHead>
                                    <TableHead className="text-right">أيام الدوام</TableHead>
                                    <TableHead className="text-right">الحالة</TableHead>
                                    <TableHead className="text-right">عدد الأطباء</TableHead>
                                    <TableHead className="text-right">عدد المواعيد</TableHead>
                                    <TableHead className="text-right">آخر تحديث</TableHead>
                                    <TableHead className="text-right">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClinics.map((clinic) => (
                                    <TableRow key={clinic.id}>
                                        <TableCell className="font-medium">{clinic.name}</TableCell>
                                        <TableCell>{clinic.specialty || 'غير محدد'}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {clinic.schedules && Array.isArray(clinic.schedules) && clinic.schedules.length > 0
                                                    ? clinic.schedules.map(schedule => {
                                                        const dayNames = {
                                                            'monday': 'الإثنين',
                                                            'tuesday': 'الثلاثاء',
                                                            'wednesday': 'الأربعاء',
                                                            'thursday': 'الخميس',
                                                            'friday': 'الجمعة',
                                                            'saturday': 'السبت',
                                                            'sunday': 'الأحد'
                                                        };
                                                        return `${dayNames[schedule.day_of_week] || schedule.day_of_week}: ${schedule.open_time}-${schedule.close_time}${schedule.is_closed ? ' (عطلة)' : ''}`;
                                                    }).join(', ')
                                                    : 'غير محدد'
                                                }
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    clinic.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }
                                            >
                                                {clinic.is_active ? 'فعالة' : 'غير فعالة'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{clinic.doctors_count}</TableCell>
                                        <TableCell>{clinic.appointments_count}</TableCell>
                                        <TableCell>{new Date(clinic.updated_at).toLocaleDateString('ar')}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button size="sm" variant="outline" onClick={() => handleViewDetails(clinic)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {canEditClinics && (
                                                    <Button size="sm" variant="outline" onClick={() => handleEdit(clinic)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {canDeleteClinics && (
                                                    <Button size="sm" variant="outline" onClick={() => handleDelete(clinic)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {filteredClinics.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                لا توجد عيادات
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || specialtyFilter || statusFilter ? 'جرب تعديل معايير البحث.' : isReadOnly ? 'لا توجد عيادات في النظام بعد.' : 'ابدأ بإضافة أول عيادة في النظام.'}
                            </p>
                            {canCreateClinics && !searchTerm && !specialtyFilter && !statusFilter && (
                                <Button onClick={() => setShowCreateModal(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    إضافة عيادة جديدة
                                </Button>
                            )}
                            {isReadOnly && !searchTerm && !specialtyFilter && !statusFilter && (
                                <Badge variant="outline">العيادات مُدارة من قبل المسؤولين</Badge>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Create Clinic Modal */}
                <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                             <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                 <Building2 className="h-5 w-5 text-primary" />
                             </div>
                                <h2 className="text-xl font-bold text-gray-900">🩺 إضافة عيادة جديدة</h2>
                            </div>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* اسم العيادة */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">اسم العيادة *</label>
                                    <TextInput
                                        placeholder="مثال: عيادة الأسنان التخصصية"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        error={createForm.errors.name}
                                        required
                                        className="w-full"
                                    />
                                    {createForm.errors.name && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <span className="ml-1">⚠️</span> {createForm.errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* التخصص */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">التخصص الطبي</label>
                                    <Select value={createForm.data.specialty} onValueChange={(value) => createForm.setData('specialty', value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="اختر التخصص" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="أسنان">أسنان</SelectItem>
                                            <SelectItem value="جلدية">جلدية</SelectItem>
                                            <SelectItem value="عيون">عيون</SelectItem>
                                            <SelectItem value="نسائية">نسائية</SelectItem>
                                            <SelectItem value="أطفال">أطفال</SelectItem>
                                            <SelectItem value="عظام">عظام</SelectItem>
                                            <SelectItem value="قلب">قلب</SelectItem>
                                            <SelectItem value="أنف وأذن وحنجرة">أنف وأذن وحنجرة</SelectItem>
                                            <SelectItem value="طب عام">طب عام</SelectItem>
                                            <SelectItem value="أخرى">أخرى</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* الوصف */}
                                <div className="lg:col-span-2 space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">الوصف</label>
                                    <Textarea
                                        placeholder="وصف مختصر عن الخدمات المقدمة في العيادة..."
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full resize-none"
                                    />
                                </div>

                                {/* الموقع */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">الموقع</label>
                                    <TextInput
                                        placeholder="مثال: الطابق الأول - غرفة 101"
                                        value={createForm.data.location}
                                        onChange={(e) => createForm.setData('location', e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* الهاتف */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">رقم الهاتف</label>
                                    <TextInput
                                        placeholder="مثال: +963 11 123 4567"
                                        value={createForm.data.phone}
                                        onChange={(e) => createForm.setData('phone', e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* البريد الإلكتروني */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">البريد الإلكتروني</label>
                                    <TextInput
                                        type="email"
                                        placeholder="clinic@example.com"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        error={createForm.errors.email}
                                        className="w-full"
                                    />
                                    {createForm.errors.email && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <span className="ml-1">⚠️</span> {createForm.errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* قسم أيام وساعات العمل */}
                                <div className="lg:col-span-2 space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                        <Clock className="h-4 w-4 ml-2" />
                                        أيام وساعات العمل *
                                    </label>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
                                        {[
                                            { key: 'saturday', label: 'السبت' },
                                            { key: 'sunday', label: 'الأحد' },
                                            { key: 'monday', label: 'الإثنين' },
                                            { key: 'tuesday', label: 'الثلاثاء' },
                                            { key: 'wednesday', label: 'الأربعاء' },
                                            { key: 'thursday', label: 'الخميس' },
                                            { key: 'friday', label: 'الجمعة' },
                                        ].map(({ key, label }, index) => {
                                            const schedule = createForm.data.schedules[index] || { day_of_week: key, open_time: '08:00', close_time: '18:00', is_closed: false };
                                            return (
                                                <div key={key} className="space-y-2 p-3 bg-white rounded-md border">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                                            <Checkbox
                                                                checked={!schedule.is_closed}
                                                                onCheckedChange={(checked) => {
                                                                    const newSchedules = [...createForm.data.schedules];
                                                                    newSchedules[index] = { ...schedule, is_closed: !checked };
                                                                    createForm.setData('schedules', newSchedules);
                                                                }}
                                                                className="ml-2"
                                                            />
                                                            {label}
                                                        </label>
                                                    </div>

                                                    <div className={`grid grid-cols-2 gap-2 ${schedule.is_closed ? 'opacity-50' : ''}`}>
                                                        <div>
                                                            <TextInput
                                                                type="time"
                                                                value={schedule.open_time}
                                                                onChange={(e) => {
                                                                    const newSchedules = [...createForm.data.schedules];
                                                                    newSchedules[index] = { ...schedule, open_time: e.target.value };
                                                                    createForm.setData('schedules', newSchedules);
                                                                }}
                                                                className="w-full text-xs"
                                                                disabled={schedule.is_closed}
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">من</p>
                                                        </div>
                                                        <div>
                                                            <TextInput
                                                                type="time"
                                                                value={schedule.close_time}
                                                                onChange={(e) => {
                                                                    const newSchedules = [...createForm.data.schedules];
                                                                    newSchedules[index] = { ...schedule, close_time: e.target.value };
                                                                    createForm.setData('schedules', newSchedules);
                                                                }}
                                                                className="w-full text-xs"
                                                                disabled={schedule.is_closed}
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">إلى</p>
                                                        </div>
                                                    </div>

                                                    {createForm.errors[`schedules.${index}.open_time`] && (
                                                        <p className="text-xs text-red-600">
                                                            {createForm.errors[`schedules.${index}.open_time`]}
                                                        </p>
                                                    )}
                                                    {createForm.errors[`schedules.${index}.close_time`] && (
                                                        <p className="text-xs text-red-600">
                                                            {createForm.errors[`schedules.${index}.close_time`]}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {createForm.errors.schedules && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <span className="ml-1">⚠️</span> {createForm.errors.schedules}
                                        </p>
                                    )}
                                </div>

                                {/* الحالة */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">حالة العيادة</label>
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="is_active_create"
                                            checked={createForm.data.is_active}
                                            onCheckedChange={(checked) => createForm.setData('is_active', checked)}
                                        />
                                        <label htmlFor="is_active_create" className="text-sm font-medium text-gray-700 cursor-pointer">
                                            العيادة فعالة
                                        </label>
                                    </div>
                                </div>

                            
                            </div>

                            {/* أزرار التحكم */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-2 hover:bg-gray-50"
                                >
                                    إلغاء
                                </Button>
                                <PrimaryButton
                                    disabled={createForm.processing}
                                    className="px-8 py-2 disabled:opacity-50"
                                >
                                    {createForm.processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 ml-2" />
                                            حفظ العيادة
                                        </>
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </Modal>

                {/* Edit Clinic Modal */}
                <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                             <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                                 <Edit className="h-5 w-5 text-secondary" />
                             </div>
                                <h2 className="text-xl font-bold text-gray-900">✏️ تعديل العيادة</h2>
                            </div>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* اسم العيادة */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">اسم العيادة *</label>
                                    <TextInput
                                        placeholder="مثال: عيادة الأسنان التخصصية"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        error={editForm.errors.name}
                                        required
                                        className="w-full"
                                    />
                                    {editForm.errors.name && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <span className="ml-1">⚠️</span> {editForm.errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* التخصص */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">التخصص الطبي</label>
                                    <Select value={editForm.data.specialty} onValueChange={(value) => editForm.setData('specialty', value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="اختر التخصص" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="أسنان">أسنان</SelectItem>
                                            <SelectItem value="جلدية">جلدية</SelectItem>
                                            <SelectItem value="عيون">عيون</SelectItem>
                                            <SelectItem value="نسائية">نسائية</SelectItem>
                                            <SelectItem value="أطفال">أطفال</SelectItem>
                                            <SelectItem value="عظام">عظام</SelectItem>
                                            <SelectItem value="قلب">قلب</SelectItem>
                                            <SelectItem value="أنف وأذن وحنجرة">أنف وأذن وحنجرة</SelectItem>
                                            <SelectItem value="طب عام">طب عام</SelectItem>
                                            <SelectItem value="أخرى">أخرى</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* الوصف */}
                                <div className="lg:col-span-2 space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">الوصف</label>
                                    <Textarea
                                        placeholder="وصف مختصر عن الخدمات المقدمة في العيادة..."
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full resize-none"
                                    />
                                </div>

                                {/* الموقع */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">الموقع</label>
                                    <TextInput
                                        placeholder="مثال: الطابق الأول - غرفة 101"
                                        value={editForm.data.location}
                                        onChange={(e) => editForm.setData('location', e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* الهاتف */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">رقم الهاتف</label>
                                    <TextInput
                                        placeholder="مثال: +963 11 123 4567"
                                        value={editForm.data.phone}
                                        onChange={(e) => editForm.setData('phone', e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* البريد الإلكتروني */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">البريد الإلكتروني</label>
                                    <TextInput
                                        type="email"
                                        placeholder="clinic@example.com"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        error={editForm.errors.email}
                                        className="w-full"
                                    />
                                    {editForm.errors.email && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <span className="ml-1">⚠️</span> {editForm.errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* الحالة */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">حالة العيادة</label>
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="is_active_edit"
                                            checked={editForm.data.is_active}
                                            onCheckedChange={(checked) => editForm.setData('is_active', checked)}
                                        />
                                        <label htmlFor="is_active_edit" className="text-sm font-medium text-gray-700 cursor-pointer">
                                            العيادة فعالة
                                        </label>
                                    </div>
                                </div>

                                {/* قسم جدول أوقات العمل */}
                                <div className="lg:col-span-2 space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                        <Clock className="h-4 w-4 ml-2" />
                                        جدول أوقات العمل *
                                    </label>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
                                        {[
                                            { key: 'saturday', label: 'السبت' },
                                            { key: 'sunday', label: 'الأحد' },
                                            { key: 'monday', label: 'الإثنين' },
                                            { key: 'tuesday', label: 'الثلاثاء' },
                                            { key: 'wednesday', label: 'الأربعاء' },
                                            { key: 'thursday', label: 'الخميس' },
                                            { key: 'friday', label: 'الجمعة' },
                                        ].map(({ key, label }, index) => {
                                            const schedule = editForm.data.schedules[index] || { day_of_week: key, open_time: '08:00', close_time: '18:00', is_closed: false };
                                            return (
                                                <div key={key} className="space-y-2 p-3 bg-white rounded-md border">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                                            <Checkbox
                                                                checked={!schedule.is_closed}
                                                                onCheckedChange={(checked) => {
                                                                    const newSchedules = [...editForm.data.schedules];
                                                                    newSchedules[index] = { ...schedule, is_closed: !checked };
                                                                    editForm.setData('schedules', newSchedules);
                                                                }}
                                                                className="ml-2"
                                                            />
                                                            {label}
                                                        </label>
                                                    </div>

                                                    <div className={`grid grid-cols-2 gap-2 ${schedule.is_closed ? 'opacity-50' : ''}`}>
                                                        <div>
                                                            <TextInput
                                                                type="time"
                                                                value={schedule.open_time}
                                                                onChange={(e) => {
                                                                    const newSchedules = [...editForm.data.schedules];
                                                                    newSchedules[index] = { ...schedule, open_time: e.target.value };
                                                                    editForm.setData('schedules', newSchedules);
                                                                }}
                                                                className="w-full text-xs"
                                                                disabled={schedule.is_closed}
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">من</p>
                                                        </div>
                                                        <div>
                                                            <TextInput
                                                                type="time"
                                                                value={schedule.close_time}
                                                                onChange={(e) => {
                                                                    const newSchedules = [...editForm.data.schedules];
                                                                    newSchedules[index] = { ...schedule, close_time: e.target.value };
                                                                    editForm.setData('schedules', newSchedules);
                                                                }}
                                                                className="w-full text-xs"
                                                                disabled={schedule.is_closed}
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">إلى</p>
                                                        </div>
                                                    </div>

                                                    {editForm.errors[`schedules.${index}.open_time`] && (
                                                        <p className="text-xs text-red-600">
                                                            {editForm.errors[`schedules.${index}.open_time`]}
                                                        </p>
                                                    )}
                                                    {editForm.errors[`schedules.${index}.close_time`] && (
                                                        <p className="text-xs text-red-600">
                                                            {editForm.errors[`schedules.${index}.close_time`]}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {editForm.errors.schedules && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <span className="ml-1">⚠️</span> {editForm.errors.schedules}
                                        </p>
                                    )}
                                </div>

                                {/* اللون */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                        <Palette className="h-4 w-4 ml-2" />
                                        لون العيادة
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="color"
                                            value={editForm.data.color}
                                            onChange={(e) => editForm.setData('color', e.target.value)}
                                            className="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600">اختر لون مميز للعيادة</span>
                                    </div>
                                </div>
                            </div>

                            {/* أزرار التحكم */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-2 hover:bg-gray-50"
                                >
                                    إلغاء
                                </Button>
                                <PrimaryButton
                                    disabled={editForm.processing}
                                    className="px-8 py-2 disabled:opacity-50"
                                >
                                    {editForm.processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="w-4 h-4 ml-2" />
                                            حفظ التغييرات
                                        </>
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-center text-gray-900 mb-2">تأكيد الحذف</h2>
                            <p className="text-center text-gray-600 mb-6">
                                هل أنت متأكد من حذف العيادة <strong>"{deletingClinic?.name}"</strong>؟
                                <br />
                                <span className="text-sm text-red-500">⚠️ هذا الإجراء لا يمكن التراجع عنه</span>
                            </p>
                            <div className="flex justify-center space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-6 py-2 hover:bg-gray-50"
                                >
                                    إلغاء
                                </Button>
                                <DangerButton
                                    onClick={confirmDelete}
                                    className="px-6 py-2"
                                >
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    حذف نهائي
                                </DangerButton>
                            </div>
                        </div>
                    </div>
                </Modal>

                {/* Clinic Details Modal */}
                <Modal show={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                 <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                                     <Eye className="h-5 w-5 text-success" />
                                 </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">تفاصيل العيادة</h2>
                                        <p className="text-sm text-gray-600">{selectedClinic?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {selectedClinic?.is_active ? (
                                        <Badge className="bg-green-100 text-green-800">فعالة</Badge>
                                    ) : (
                                        <Badge className="bg-red-100 text-red-800">غير فعالة</Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {selectedClinic && (
                            <div className="p-6 space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">المعلومات الأساسية</label>
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">اسم العيادة:</span>
                                                    <span className="text-sm font-medium">{selectedClinic.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">التخصص:</span>
                                                    <span className="text-sm font-medium">{selectedClinic.specialty || 'غير محدد'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">الموقع:</span>
                                                    <span className="text-sm font-medium">{selectedClinic.location || 'غير محدد'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">الحالة:</span>
                                                    <Badge className={selectedClinic.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                        {selectedClinic.is_active ? 'فعالة' : 'غير فعالة'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">معلومات التواصل</label>
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">الهاتف:</span>
                                                    <span className="text-sm font-medium">{selectedClinic.phone || 'غير محدد'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">البريد الإلكتروني:</span>
                                                    <span className="text-sm font-medium">{selectedClinic.email || 'غير محدد'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">أوقات العمل</label>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                {selectedClinic.schedules && Array.isArray(selectedClinic.schedules) && selectedClinic.schedules.length > 0 ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {selectedClinic.schedules.map((schedule, index) => {
                                                            const dayNames = {
                                                                'monday': 'الإثنين',
                                                                'tuesday': 'الثلاثاء',
                                                                'wednesday': 'الأربعاء',
                                                                'thursday': 'الخميس',
                                                                'friday': 'الجمعة',
                                                                'saturday': 'السبت',
                                                                'sunday': 'الأحد'
                                                            };
                                                            return (
                                                                <div key={index} className={`p-3 rounded-md border ${schedule.is_closed ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                                                                    <div className="text-sm font-medium text-gray-900 mb-1">
                                                                        {dayNames[schedule.day_of_week] || schedule.day_of_week}
                                                                    </div>
                                                                    {schedule.is_closed ? (
                                                                        <div className="text-xs text-red-600 font-medium">عطلة</div>
                                                                    ) : (
                                                                        <div className="text-xs text-gray-600">
                                                                            {schedule.open_time} - {schedule.close_time}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-500 text-center py-4">لا توجد أوقات عمل محددة</div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">الإحصائيات</label>
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">عدد الأطباء:</span>
                                                    <span className="text-sm font-medium">{selectedClinic.doctors_count}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">عدد المواعيد:</span>
                                                    <span className="text-sm font-medium">{selectedClinic.appointments_count}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">الحد الأقصى للمرضى يومياً:</span>
                                                    <span className="text-sm font-medium">{selectedClinic.max_patients_per_day || 'غير محدد'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">مدة الاستشارة:</span>
                                                    <span className="text-sm font-medium">{selectedClinic.consultation_duration_minutes ? `${selectedClinic.consultation_duration_minutes} دقيقة` : 'غير محدد'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {selectedClinic.description && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف</label>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-800">{selectedClinic.description}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Additional Information */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">معلومات إضافية</label>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">رئيس الأطباء:</span>
                                                <p className="font-medium">{selectedClinic.head_doctor || 'غير محدد'}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">تاريخ الإنشاء:</span>
                                                <p className="font-medium">{selectedClinic.created_at ? new Date(selectedClinic.created_at).toLocaleDateString('ar') : 'غير محدد'}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">آخر تحديث:</span>
                                                <p className="font-medium">{selectedClinic.updated_at ? new Date(selectedClinic.updated_at).toLocaleDateString('ar') : 'غير محدد'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Close Button */}
                                <div className="flex justify-end pt-4 border-t border-gray-200">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowDetailsModal(false)}
                                        className="px-6 py-2"
                                    >
                                        إغلاق
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>

                {/* Toaster for notifications */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                            fontSize: '14px',
                            borderRadius: '8px',
                        },
                        success: {
                            icon: '✅',
                            style: {
                                background: '#10b981',
                            },
                        },
                        error: {
                            icon: '❌',
                            style: {
                                background: '#ef4444',
                            },
                        },
                    }}
                />
            </div>
        </AuthenticatedLayout>
    );
}