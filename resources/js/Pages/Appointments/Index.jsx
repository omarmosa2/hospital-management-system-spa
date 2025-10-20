import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Calendar, Search, Plus, Filter, Clock, CheckCircle,
    AlertCircle, User, Stethoscope, MapPin, Edit, Eye, Trash2
} from 'lucide-react';

export default function AppointmentsIndex({ appointments, auth }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Ensure appointments is always an array
    const appointmentsArray = Array.isArray(appointments) ? appointments : (appointments?.data ? appointments.data : []);

    // Role-based permissions
    const userRole = auth.user.role;
    const canManageAppointments = userRole === 'admin' || userRole === 'reception';
    const canCreateAppointments = userRole === 'admin' || userRole === 'reception';
    const canEditAppointments = userRole === 'admin' || userRole === 'reception';
    const canDeleteAppointments = userRole === 'admin' || userRole === 'reception';
    const isDoctorView = userRole === 'doctor';

    // Filter appointments for doctors to show only their own appointments
    const filteredAppointmentsArray = isDoctorView
        ? appointmentsArray.filter(appointment => appointment.doctor_id === auth.user.doctor_id)
        : appointmentsArray;

    const filteredAppointments = filteredAppointmentsArray.filter(appointment => {
        const matchesSearch =
            appointment.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.doctor?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const statusConfig = {
            scheduled: { class: 'bg-blue-100 text-blue-800', icon: Clock },
            confirmed: { class: 'bg-green-100 text-green-800', icon: CheckCircle },
            completed: { class: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
            cancelled: { class: 'bg-red-100 text-red-800', icon: AlertCircle },
            'no-show': { class: 'bg-gray-100 text-gray-800', icon: AlertCircle }
        };

        const config = statusConfig[status] || statusConfig.scheduled;
        const Icon = config.icon;

        return (
            <Badge className={config.class}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Appointments Management
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {isDoctorView ? 'View your scheduled appointments (Doctor Access)' : 'Schedule and manage appointments'}
                        </p>
                    </div>
                    {canCreateAppointments && (
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            New Appointment
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="Appointments" />

            <div className="space-y-6">
                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center">
                                    <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                                    {isDoctorView ? 'My Appointments' : 'All Appointments'}
                                </CardTitle>
                                <CardDescription>
                                    {filteredAppointments.length} appointments found {isDoctorView && '- Your appointments only'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search appointments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex space-x-2">
                                {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map((status) => (
                                    <Button
                                        key={status}
                                        variant={statusFilter === status ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setStatusFilter(status)}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointments List */}
                <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                        <Card key={appointment.id} className="hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Calendar className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {appointment.patient?.first_name} {appointment.patient?.last_name}
                                                </h3>
                                                {getStatusBadge(appointment.status)}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <Stethoscope className="h-4 w-4 mr-2" />
                                                    Dr. {appointment.doctor?.user?.name}
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    {new Date(appointment.appointment_date + ' ' + appointment.appointment_time).toLocaleString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <MapPin className="h-4 w-4 mr-2" />
                                                    {appointment.clinic?.name || 'No clinic specified'}
                                                </div>
                                            </div>
                                            {appointment.notes && (
                                                <p className="text-sm text-gray-500 mt-2">
                                                    <strong>Notes:</strong> {appointment.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm">
                                            <Eye className="mr-1 h-3 w-3" />
                                            View Details
                                        </Button>
                                        {canEditAppointments && (
                                            <Button size="sm">
                                                <Edit className="mr-1 h-3 w-3" />
                                                Edit
                                            </Button>
                                        )}
                                        {canDeleteAppointments && (
                                            <Button size="sm" variant="destructive">
                                                <Trash2 className="mr-1 h-3 w-3" />
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredAppointments.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No appointments found
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : isDoctorView
                                        ? 'No appointments scheduled for you yet.'
                                        : 'Get started by scheduling your first appointment.'
                                }
                            </p>
                            {!searchTerm && statusFilter === 'all' && canCreateAppointments && (
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Schedule Appointment
                                </Button>
                            )}
                            {isDoctorView && !searchTerm && statusFilter === 'all' && (
                                <Badge variant="outline">Contact reception to schedule appointments</Badge>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}