import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import {
    Users, Search, Plus, Filter, MoreHorizontal, ChevronDown, ChevronUp,
    Phone, Mail, Calendar, MapPin, Eye, Edit, Trash2, ArrowUpDown,
    CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PatientsIndex({ patients, auth, canCreate, canEdit, canDelete, userRole, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');

    // Ensure patients is always an array
    const patientsArray = Array.isArray(patients) ? patients : (patients?.data ? patients.data : []);

    const filteredPatients = patientsArray.filter(patient => {
        const matchesSearch = !searchTerm ||
            patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.identity_number?.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && patient.is_active) ||
            (statusFilter === 'inactive' && !patient.is_active);

        return matchesSearch && matchesStatus;
    });

    const sortedPatients = [...filteredPatients].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'age') {
            aValue = a.date_of_birth ? new Date(a.date_of_birth).getTime() : 0;
            bValue = b.date_of_birth ? new Date(b.date_of_birth).getTime() : 0;
        }

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (statusFilter !== 'all') params.set('status', statusFilter);

        router.visit(`/patients?${params.toString()}`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSort = (column) => {
        const newDirection = sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortDirection(newDirection);
    };

    const getSortIcon = (column) => {
        if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />;
        return sortDirection === 'asc' ?
            <ChevronUp className="h-4 w-4" /> :
            <ChevronDown className="h-4 w-4" />;
    };

    // Role-based permissions passed from controller


    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            إدارة المرضى
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            إدارة سجلات المرضى والمعلومات
                        </p>
                    </div>
                    {canCreate && (
                        <Link href={route('patients.create')}>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" />
                                إضافة مريض جديد
                            </Button>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Patients" />

            <div className="space-y-6">
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
                                    تم العثور على {sortedPatients.length} مريض
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="البحث في المرضى..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10"
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع المرضى</SelectItem>
                                    <SelectItem value="active">النشطين</SelectItem>
                                    <SelectItem value="inactive">غير النشطين</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button onClick={handleSearch} variant="outline">
                                <Filter className="mr-2 h-4 w-4" />
                                تصفية
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Patients Table/List View */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('full_name')}>
                                        <div className="flex items-center">
                                            الاسم {getSortIcon('full_name')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('patient_id')}>
                                        <div className="flex items-center">
                                            رقم المريض {getSortIcon('patient_id')}
                                        </div>
                                    </TableHead>
                                    <TableHead>التواصل</TableHead>
                                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('age')}>
                                        <div className="flex items-center">
                                            العمر {getSortIcon('age')}
                                        </div>
                                    </TableHead>
                                    <TableHead>الحالة</TableHead>
                                    <TableHead>الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedPatients.map((patient) => (
                                    <TableRow key={patient.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-medium text-blue-700">
                                                        {patient.full_name?.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium">{patient.full_name}</div>
                                                    <div className="text-sm text-gray-500">{patient.identity_number}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{patient.patient_id}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="flex items-center">
                                                    <Phone className="h-3 w-3 ml-1" />
                                                    {patient.phone}
                                                </div>
                                                {patient.email && (
                                                    <div className="flex items-center text-gray-500">
                                                        <Mail className="h-3 w-3 ml-1" />
                                                        {patient.email}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{patient.age ? `${patient.age} سنة` : 'غير محدد'}</TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    patient.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }
                                            >
                                                {patient.is_active ? 'نشط' : 'غير نشط'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Link href={route('patients.show', patient.id)}>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                </Link>
                                                {canEdit && (
                                                    <Link href={route('patients.edit', patient.id)}>
                                                        <Button size="sm" variant="outline">
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                    </Link>
                                                )}
                                                {canDelete && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            if (confirm('هل أنت متأكد من حذف هذا المريض؟')) {
                                                                router.delete(route('patients.destroy', patient.id), {
                                                                    onSuccess: () => toast.success('تم حذف المريض بنجاح'),
                                                                    onError: () => toast.error('فشل في حذف المريض')
                                                                });
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
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

                {sortedPatients.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No patients found
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm ? 'جرب تعديل كلمات البحث.' : 'ابدأ بإضافة أول مريض.'}
                            </p>
                            {!searchTerm && canCreate && (
                                <Link href={route('patients.create')}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        إضافة مريض جديد
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}