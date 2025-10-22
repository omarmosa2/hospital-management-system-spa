import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
    User, Phone, MapPin, Heart, Calendar, FileText,
    Pill, CreditCard, Edit, ArrowLeft, Activity, AlertTriangle
} from 'lucide-react';

export default function ShowPatient() {
    const { auth, patient, appointments, medicalRecords, prescriptions, bills } = usePage().props;
    const [activeTab, setActiveTab] = useState('overview');

    if (!patient) {
        return (
            <AuthenticatedLayout>
                <div className="text-center py-12">
                    <p>Patient not found</p>
                    <Button as={Link} href="/patients">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Patients
                    </Button>
                </div>
            </AuthenticatedLayout>
        );
    }

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <Badge className="bg-green-100 text-green-800">Active</Badge>
        ) : (
            <Badge className="bg-red-100 text-red-800">Inactive</Badge>
        );
    };

    const getGenderBadge = (gender) => {
        const colors = {
            'male': 'bg-blue-100 text-blue-800',
            'female': 'bg-pink-100 text-pink-800',
            'other': 'bg-purple-100 text-purple-800'
        };
        return (
            <Badge className={colors[gender] || 'bg-gray-100 text-gray-800'}>
                {gender || 'Not specified'}
            </Badge>
        );
    };

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 'N/A';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    const calculateBMI = () => {
        if (patient.height_cm && patient.weight_kg) {
            const heightM = patient.height_cm / 100;
            return (patient.weight_kg / (heightM * heightM)).toFixed(1);
        }
        return 'N/A';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" as={Link} href="/patients">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Patients
                        </Button>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                {patient.first_name} {patient.last_name}
                            </h2>
                            <p className="text-sm text-gray-600">
                                Patient ID: {patient.patient_id} • Age: {calculateAge(patient.date_of_birth)}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" as={Link} href={`/patients/${patient.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Patient
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={`${patient.first_name} ${patient.last_name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Patient Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center">
                                    <Activity className="h-8 w-8 text-blue-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Status</p>
                                        <div className="text-2xl font-bold">{getStatusBadge(patient.is_active)}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center">
                                    <Heart className="h-8 w-8 text-red-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Blood Type</p>
                                        <p className="text-2xl font-bold">{patient.blood_type || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center">
                                    <Activity className="h-8 w-8 text-green-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">BMI</p>
                                        <p className="text-2xl font-bold">{calculateBMI()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center">
                                    <Calendar className="h-8 w-8 text-purple-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Last Visit</p>
                                        <p className="text-lg font-bold">
                                            {patient.last_visit_date ?
                                                new Date(patient.last_visit_date).toLocaleDateString()
                                                : 'Never'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="appointments">Appointments</TabsTrigger>
                            <TabsTrigger value="records">Medical Records</TabsTrigger>
                            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                            <TabsTrigger value="billing">Billing</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <User className="mr-2 h-5 w-5" />
                                            Personal Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Full Name</p>
                                                <p className="font-semibold">
                                                    {patient.first_name} {patient.middle_name} {patient.last_name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Gender</p>
                                                <p>{getGenderBadge(patient.gender)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                                                <p className="font-semibold">
                                                    {patient.date_of_birth ?
                                                        new Date(patient.date_of_birth).toLocaleDateString()
                                                        : 'Not specified'
                                                    }
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Age</p>
                                                <p className="font-semibold">
                                                    {calculateAge(patient.date_of_birth)} years old
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t">
                                            <div className="flex items-start gap-2">
                                                <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Contact Information</p>
                                                    <p className="font-semibold">{patient.phone}</p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Emergency: {patient.emergency_contact} ({patient.emergency_phone})
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {patient.address && (
                                            <div className="pt-4 border-t">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Address</p>
                                                        <p className="font-semibold">{patient.address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Medical Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Heart className="mr-2 h-5 w-5" />
                                            Medical Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Height</p>
                                                <p className="font-semibold">{patient.height_cm || 'N/A'} cm</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Weight</p>
                                                <p className="font-semibold">{patient.weight_kg || 'N/A'} kg</p>
                                            </div>
                                        </div>

                                        {patient.primary_doctor && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Primary Doctor</p>
                                                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold">{patient.primary_doctor.user?.name}</p>
                                                            <p className="text-sm text-gray-600">{patient.primary_doctor.specialization}</p>
                                                        </div>
                                                        {patient.primary_doctor.schedules && patient.primary_doctor.schedules.length > 0 && (
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium text-gray-600">Schedule</p>
                                                                <div className="mt-1 space-y-1">
                                                                    {patient.primary_doctor.schedules.map((schedule) => (
                                                                        <div key={schedule.id} className="text-xs text-gray-500">
                                                                            <span className="font-medium">{schedule.day_name_ar}:</span>
                                                                            {schedule.is_closed ? (
                                                                                <span className="text-red-500"> Closed</span>
                                                                            ) : (
                                                                                <span> {schedule.open_time} - {schedule.close_time}</span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {patient.allergies && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Allergies</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {patient.allergies.split(',').map((allergy, index) => (
                                                        <Badge key={index} variant="outline" className="text-red-600 border-red-300">
                                                            {allergy.trim()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {patient.medical_conditions && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Medical Conditions</p>
                                                <p className="text-sm">{patient.medical_conditions}</p>
                                            </div>
                                        )}

                                        {patient.current_medications && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Current Medications</p>
                                                <p className="text-sm">{patient.current_medications}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Appointments Tab */}
                        <TabsContent value="appointments">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Appointments</CardTitle>
                                    <CardDescription>
                                        Appointment history and upcoming visits
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {appointments && appointments.length > 0 ? (
                                        <div className="space-y-4">
                                            {appointments.map((appointment) => (
                                                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div>
                                                        <div className="font-medium">
                                                            {new Date(appointment.scheduled_datetime).toLocaleDateString()} at{' '}
                                                            {new Date(appointment.scheduled_datetime).toLocaleTimeString()}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            with {appointment.doctor?.user?.name || 'Unknown Doctor'} • {appointment.appointment_type}
                                                        </div>
                                                    </div>
                                                    <Badge className={
                                                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }>
                                                        {appointment.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 py-8">No appointments found</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Medical Records Tab */}
                        <TabsContent value="records">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Medical Records</CardTitle>
                                    <CardDescription>
                                        Patient's medical history and consultations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {medicalRecords && medicalRecords.length > 0 ? (
                                        <div className="space-y-4">
                                            {medicalRecords.map((record) => (
                                                <div key={record.id} className="p-4 border rounded-lg">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-medium">
                                                                {new Date(record.consultation_date).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                by {record.doctor?.user?.name || 'Unknown Doctor'}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline">{record.record_type}</Badge>
                                                    </div>
                                                    {record.diagnosis && (
                                                        <p className="text-sm"><strong>Diagnosis:</strong> {record.diagnosis}</p>
                                                    )}
                                                    {record.treatment_plan && (
                                                        <p className="text-sm"><strong>Treatment:</strong> {record.treatment_plan}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 py-8">No medical records found</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Prescriptions Tab */}
                        <TabsContent value="prescriptions">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Prescriptions</CardTitle>
                                    <CardDescription>
                                        Current and past medication prescriptions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {prescriptions && prescriptions.length > 0 ? (
                                        <div className="space-y-4">
                                            {prescriptions.map((prescription) => (
                                                <div key={prescription.id} className="p-4 border rounded-lg">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-medium">{prescription.medication_name}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {prescription.dosage} • {prescription.frequency}
                                                            </p>
                                                        </div>
                                                        <Badge className={
                                                            prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }>
                                                            {prescription.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Prescribed on {new Date(prescription.start_date).toLocaleDateString()}
                                                        by {prescription.doctor?.user?.name || 'Unknown Doctor'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 py-8">No prescriptions found</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Billing Tab */}
                        <TabsContent value="billing">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Billing History</CardTitle>
                                    <CardDescription>
                                        Payment history and outstanding bills
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {bills && bills.length > 0 ? (
                                        <div className="space-y-4">
                                            {bills.map((bill) => (
                                                <div key={bill.id} className="p-4 border rounded-lg">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-medium">Bill #{bill.bill_number}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {new Date(bill.bill_date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold">${bill.total_amount}</p>
                                                            <Badge className={
                                                                bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                                bill.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }>
                                                                {bill.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Due: {new Date(bill.due_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 py-8">No billing records found</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}