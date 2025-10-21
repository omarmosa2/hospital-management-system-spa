import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import {
    DollarSign, Calculator, TrendingUp, Users,
    Calendar, Filter, Download, Eye
} from 'lucide-react';

export default function PaymentsIndex() {
    const { doctors, appointments, stats } = usePage().props;
    const [filters, setFilters] = useState({
        doctor_id: 'all',
        date_from: '',
        date_to: '',
        payment_status: 'all'
    });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR'
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'paid': { variant: 'default', label: 'مدفوع بالكامل' },
            'partial': { variant: 'secondary', label: 'مدفوع جزئيًا' },
            'unpaid': { variant: 'destructive', label: 'غير مدفوع' }
        };

        const config = statusMap[status] || statusMap.unpaid;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        إدارة المدفوعات والأجور
                    </h2>
                    <Button>
                        <Download className="mr-2 h-4 w-4" />
                        تصدير التقرير
                    </Button>
                </div>
            }
        >
            <Head title="المدفوعات والأجور" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* إحصائيات عامة */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    إجمالي الإيرادات
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats?.total_revenue || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    هذا الشهر
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    صافي أجور المركز
                                </CardTitle>
                                <Calculator className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats?.total_center_fee || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    بعد الخصومات
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    إجمالي أجور الأطباء
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats?.total_doctor_fee || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    المستحق للأطباء
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    عدد المواعيد
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats?.total_appointments || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    هذا الشهر
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* فلاتر البحث */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Filter className="mr-2 h-5 w-5" />
                                فلترة البيانات
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Label>الطبيب</Label>
                                    <Select value={filters.doctor_id} onValueChange={(value) => handleFilterChange('doctor_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="جميع الأطباء" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">جميع الأطباء</SelectItem>
                                            {doctors?.map((doctor) => (
                                                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                    {doctor.user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>من تاريخ</Label>
                                    <Input
                                        type="date"
                                        value={filters.date_from}
                                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label>إلى تاريخ</Label>
                                    <Input
                                        type="date"
                                        value={filters.date_to}
                                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label>حالة الدفع</Label>
                                    <Select value={filters.payment_status} onValueChange={(value) => handleFilterChange('payment_status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="جميع الحالات" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">جميع الحالات</SelectItem>
                                            <SelectItem value="paid">مدفوع بالكامل</SelectItem>
                                            <SelectItem value="partial">مدفوع جزئيًا</SelectItem>
                                            <SelectItem value="unpaid">غير مدفوع</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* جدول المواعيد والمدفوعات */}
                    <Card>
                        <CardHeader>
                            <CardTitle>تفاصيل المواعيد والمدفوعات</CardTitle>
                            <CardDescription>
                                عرض شامل لجميع المعاملات المالية
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>المريض</TableHead>
                                        <TableHead>الطبيب</TableHead>
                                        <TableHead>التاريخ</TableHead>
                                        <TableHead>نوع الزيارة</TableHead>
                                        <TableHead>المبلغ المستلم</TableHead>
                                        <TableHead>أجور الطبيب</TableHead>
                                        <TableHead>أجور المركز</TableHead>
                                        <TableHead>حالة الدفع</TableHead>
                                        <TableHead>الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appointments?.map((appointment) => (
                                        <TableRow key={appointment.id}>
                                            <TableCell>
                                                {appointment.patient?.user?.name || 'غير محدد'}
                                            </TableCell>
                                            <TableCell>
                                                {appointment.doctor?.user?.name || 'غير محدد'}
                                            </TableCell>
                                            <TableCell>
                                                {appointment.scheduled_datetime ?
                                                    new Date(appointment.scheduled_datetime).toLocaleDateString('ar-SA') :
                                                    'غير محدد'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {appointment.visit_type === 'consultation' ? 'معاينة' : 'مراجعة'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(appointment.amount_received)}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(appointment.total_doctor_fee)}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(appointment.total_center_fee)}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(appointment.payment_status)}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    عرض التفاصيل
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* ملخص الأجور حسب الطبيب */}
                    <Card>
                        <CardHeader>
                            <CardTitle>ملخص الأجور حسب الطبيب</CardTitle>
                            <CardDescription>
                                إجمالي المستحقات لكل طبيب
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {doctors?.map((doctor) => {
                                    const doctorAppointments = appointments?.filter(apt => apt.doctor_id == doctor.id) || [];
                                    const totalDoctorFee = doctorAppointments.reduce((sum, apt) => sum + (apt.total_doctor_fee || 0), 0);
                                    const totalPatients = doctorAppointments.length;

                                    return (
                                        <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <h4 className="font-semibold">{doctor.user.name}</h4>
                                                <p className="text-sm text-gray-600">
                                                    التخصص: {doctor.specialization} | عدد المرضى: {totalPatients}
                                                </p>
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold text-lg">
                                                    {formatCurrency(totalDoctorFee)}
                                                </div>
                                                <p className="text-sm text-gray-600">إجمالي المستحقات</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}