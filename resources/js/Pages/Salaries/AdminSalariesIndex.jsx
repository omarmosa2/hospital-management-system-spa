import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import {
    DollarSign, Plus, Search, Filter, Edit, Trash2, Eye,
    Calendar, User, TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react';

export default function AdminSalariesIndex({ salaries, doctors }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Ensure salaries is always an array
    const salariesArray = Array.isArray(salaries) ? salaries : (salaries?.data ? salaries.data : []);

    const filteredSalaries = salariesArray.filter(salary => {
        const matchesSearch = salary.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             salary.doctor_id?.toString().includes(searchTerm);

        const matchesStatus = filterStatus === 'all' || salary.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const handleDelete = (salaryId) => {
        if (confirm('Are you sure you want to delete this salary record?')) {
            router.delete(`/salaries/${salaryId}`);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'overdue':
                return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const totalSalaries = filteredSalaries.reduce((sum, salary) => sum + parseFloat(salary.amount || 0), 0);
    const paidSalaries = filteredSalaries.filter(s => s.status === 'paid').reduce((sum, salary) => sum + parseFloat(salary.amount || 0), 0);
    const pendingSalaries = filteredSalaries.filter(s => s.status === 'pending').reduce((sum, salary) => sum + parseFloat(salary.amount || 0), 0);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Salary Management
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage doctor salaries and payments (Admin Access)
                        </p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Salary Record
                    </Button>
                </div>
            }
        >
            <Head title="Salaries - Admin" />

            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Salaries</CardTitle>
                            <DollarSign className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalSalaries.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                For selected period
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Paid</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">${paidSalaries.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                Completed payments
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">${pendingSalaries.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting payment
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <DollarSign className="mr-2 h-5 w-5 text-blue-600" />
                            Salary Records
                        </CardTitle>
                        <CardDescription>
                            Manage and track all doctor salary payments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by doctor name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Salaries Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Base Salary</TableHead>
                                    <TableHead>Bonus</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Month/Year</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSalaries.map((salary) => (
                                    <TableRow key={salary.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{salary.doctor_name}</p>
                                                    <p className="text-sm text-gray-500">ID: {salary.doctor_id}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>${parseFloat(salary.base_salary || 0).toFixed(2)}</TableCell>
                                        <TableCell>${parseFloat(salary.bonus || 0).toFixed(2)}</TableCell>
                                        <TableCell className="font-medium">${parseFloat(salary.amount || 0).toFixed(2)}</TableCell>
                                        <TableCell>{salary.month}/{salary.year}</TableCell>
                                        <TableCell>{getStatusBadge(salary.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button size="sm" variant="outline">
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                                <Button size="sm">
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(salary.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {filteredSalaries.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No salary records found
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || filterStatus !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Get started by adding salary records for doctors.'}
                            </p>
                            {!searchTerm && filterStatus === 'all' && (
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New Salary Record
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}