import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
    Calendar, Clock, User, MapPin, Phone, Eye,
    CheckCircle, AlertCircle, Calendar as CalendarIcon
} from 'lucide-react';

export default function DoctorAppointmentsIndex({ appointments, auth }) {
    const [activeTab, setActiveTab] = useState('today');

    // Ensure appointments is always an array
    const appointmentsArray = Array.isArray(appointments) ? appointments : (appointments?.data ? appointments.data : []);

    // Filter appointments for current doctor
    const doctorAppointments = appointmentsArray.filter(appointment => appointment.doctor_id === auth.user.doctor_id);

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const todaysAppointments = doctorAppointments.filter(appointment => appointment.appointment_date === todayString);
    const upcomingAppointments = doctorAppointments.filter(appointment => appointment.appointment_date > todayString);
    const pastAppointments = doctorAppointments.filter(appointment => appointment.appointment_date < todayString);

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

    const getCurrentTabAppointments = () => {
        switch (activeTab) {
            case 'today':
                return todaysAppointments;
            case 'upcoming':
                return upcomingAppointments;
            case 'past':
                return pastAppointments;
            default:
                return todaysAppointments;
        }
    };

    const currentAppointments = getCurrentTabAppointments();

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            My Appointments
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            View your scheduled appointments (Doctor Access)
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            {today.toLocaleDateString()}
                        </Badge>
                    </div>
                </div>
            }
        >
            <Head title="My Appointments - Doctor" />

            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{todaysAppointments.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Scheduled for today
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                            <Clock className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Future appointments
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {pastAppointments.filter(a => a.status === 'completed').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                This month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Appointments Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="today">Today ({todaysAppointments.length})</TabsTrigger>
                        <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
                        <TabsTrigger value="past">Past</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                                    {activeTab === 'today' && 'Today\'s Appointments'}
                                    {activeTab === 'upcoming' && 'Upcoming Appointments'}
                                    {activeTab === 'past' && 'Past Appointments'}
                                </CardTitle>
                                <CardDescription>
                                    {activeTab === 'today' && 'Your appointments scheduled for today'}
                                    {activeTab === 'upcoming' && 'Your future scheduled appointments'}
                                    {activeTab === 'past' && 'Your previous appointments history'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {currentAppointments.length > 0 ? (
                                    <div className="space-y-4">
                                        {currentAppointments.map((appointment) => (
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
                                                                ID: {appointment.patient_id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(appointment.status)}
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
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No appointments found
                                        </h3>
                                        <p className="text-gray-500">
                                            {activeTab === 'today' && 'No appointments scheduled for today.'}
                                            {activeTab === 'upcoming' && 'No upcoming appointments scheduled.'}
                                            {activeTab === 'past' && 'No past appointments found.'}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}