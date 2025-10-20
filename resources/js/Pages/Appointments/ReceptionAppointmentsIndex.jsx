import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Calendar, Plus, Search, Filter, Edit, Eye, Trash2,
    Phone, Clock, User, MapPin, CheckCircle, AlertCircle
} from 'lucide-react';

export default function ReceptionAppointmentsIndex({ appointments }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Ensure appointments is always an array
    const appointmentsArray = Array.isArray(appointments) ? appointments : (appointments?.data ? appointments.data : []);

    const filteredAppointments = appointmentsArray.filter(appointment => {
        const matchesSearch = appointment.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             appointment.patient_id?.toString().includes(searchTerm) ||
                             appointment.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleDelete = (appointmentId) => {
        if (confirm('Are you sure you want to delete this appointment?')) {
            router.delete(`/appointments/${appointmentId}`);
        }
    };

    const handleStatusUpdate = (appointmentId, newStatus) => {
        router.patch(`/appointments/${appointmentId}`, {
            status: newStatus
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'scheduled':
                return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
            case 'completed':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
            case 'no-show':
                return <Badge className="bg-gray-100 text-gray-800">No Show</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Summary stats
    const totalAppointments = filteredAppointments.length;
    const scheduledAppointments = filteredAppointments.filter(a => a.status === 'scheduled').length;
    const completedAppointments = filteredAppointments.filter(a => a.status === 'completed').length;
    const cancelledAppointments = filteredAppointments.filter(a => a.status === 'cancelled').length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Appointments Management
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Schedule and manage appointments (Reception Access)
                        </p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule New Appointment
                    </Button>
                </div>
            }
        >
            <Head title="Appointments - Reception" />

            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <Calendar className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalAppointments}</div>
                            <p className="text-xs text-muted-foreground">
                                All appointments
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                            <Clock className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{scheduledAppointments}</div>
                            <p className="text-xs text-muted-foreground">
                                Upcoming appointments
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{completedAppointments}</div>
                            <p className="text-xs text-muted-foreground">
                                Finished appointments
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{cancelledAppointments}</div>
                            <p className="text-xs text-muted-foreground">
                                Cancelled appointments
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                            All Appointments
                        </CardTitle>
                        <CardDescription>
                            Manage and track all patient appointments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by patient, doctor, or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="no-show">No Show</option>
                            </select>
                            <Button variant="outline">
                                <Filter className="mr-2 h-4 w-4" />
                                More Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointments List */}
                <Card>
                    <CardContent className="p-0">
                        <div className="space-y-4 p-6">
                            {filteredAppointments.map((appointment) => (
                                <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {appointment.patient_name || `Patient #${appointment.patient_id}`}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    with Dr. {appointment.doctor_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getStatusBadge(appointment.status)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {new Date(appointment.appointment_date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Clock className="h-4 w-4 mr-2" />
                                            {appointment.appointment_time}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            {appointment.clinic_name || 'Clinic not specified'}
                                        </div>
                                    </div>

                                    {appointment.notes && (
                                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600">
                                                <strong>Notes:</strong> {appointment.notes}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            {appointment.patient_phone && (
                                                <div className="flex items-center">
                                                    <Phone className="h-4 w-4 mr-1" />
                                                    {appointment.patient_phone}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="outline">
                                                <Eye className="mr-1 h-3 w-3" />
                                                View
                                            </Button>
                                            <Button size="sm">
                                                <Edit className="mr-1 h-3 w-3" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(appointment.id)}
                                            >
                                                <Trash2 className="mr-1 h-3 w-3" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredAppointments.length === 0 && (
                                <div className="text-center py-12">
                                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No appointments found
                                    </h3>
                                    <p className="text-gray-500 mb-4">
                                        {searchTerm || statusFilter !== 'all'
                                            ? 'Try adjusting your search or filter criteria.'
                                            : 'Get started by scheduling your first appointment.'}
                                    </p>
                                    {!searchTerm && statusFilter === 'all' && (
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Schedule New Appointment
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}