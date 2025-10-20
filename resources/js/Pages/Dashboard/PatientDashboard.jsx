import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    User, Calendar, FileText, Pill, CreditCard, Clock,
    CheckCircle, AlertCircle, Heart, Activity, Bell
} from 'lucide-react';

export default function PatientDashboard() {
    const { auth, stats } = usePage().props;
    const [dashboardData, setDashboardData] = useState({
        upcomingAppointments: 0,
        totalRecords: 0,
        activePrescriptions: 0,
        pendingBills: 0,
        lastVisit: null,
        nextAppointment: null
    });

    useEffect(() => {
        if (stats) {
            setDashboardData(stats);
        }
    }, [stats]);

    const statCards = [
        {
            title: 'Upcoming Appointments',
            value: dashboardData.upcomingAppointments,
            icon: Calendar,
            description: 'Scheduled visits',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Medical Records',
            value: dashboardData.totalRecords,
            icon: FileText,
            description: 'Total health records',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Active Prescriptions',
            value: dashboardData.activePrescriptions,
            icon: Pill,
            description: 'Current medications',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Pending Bills',
            value: dashboardData.pendingBills,
            icon: CreditCard,
            description: 'Awaiting payment',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Patient Portal
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Welcome back, {auth.user.name}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge className="bg-green-100 text-green-800">
                            <Heart className="w-3 h-3 mr-1" />
                            Active Patient
                        </Badge>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Patient Dashboard" />

            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">
                                Welcome back, {auth.user.name}! 💚
                            </h1>
                            <p className="text-emerald-100 mb-4">
                                Manage your health records and appointments with ease.
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>{dashboardData.upcomingAppointments} upcoming appointments</span>
                                </div>
                                {dashboardData.lastVisit && (
                                    <div className="flex items-center">
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        <span>Last visit: {dashboardData.lastVisit}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-center">
                                    <Heart className="h-8 w-8 mx-auto mb-2 text-white" />
                                    <div className="text-lg font-bold">
                                        {dashboardData.activePrescriptions}
                                    </div>
                                    <div className="text-xs text-emerald-100">
                                        Active Prescriptions
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => (
                        <Card key={index} className={`hover:shadow-lg transition-shadow duration-200 ${stat.bgColor}`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upcoming Appointments */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                                Upcoming Appointments
                            </CardTitle>
                            <CardDescription>
                                Your scheduled medical visits
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <Calendar className="h-4 w-4 text-blue-600 mr-3" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Dr. Sarah Smith</p>
                                        <p className="text-xs text-gray-500">Tomorrow 10:00 AM - General Checkup</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <Calendar className="h-4 w-4 text-gray-600 mr-3" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Cardiology Department</p>
                                        <p className="text-xs text-gray-500">Next week - Heart Screening</p>
                                    </div>
                                    <Badge variant="outline">Pending</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Prescriptions */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Pill className="mr-2 h-5 w-5 text-purple-600" />
                                Current Medications
                            </CardTitle>
                            <CardDescription>
                                Your active prescriptions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                                    <Pill className="h-4 w-4 text-purple-600 mr-3" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Lisinopril 10mg</p>
                                        <p className="text-xs text-gray-500">Take once daily - Blood pressure</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                                    <Pill className="h-4 w-4 text-orange-600 mr-3" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Vitamin D3 1000 IU</p>
                                        <p className="text-xs text-gray-500">Take once daily - Supplement</p>
                                    </div>
                                    <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Health Summary */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="mr-2 h-5 w-5 text-emerald-600" />
                            Health Summary
                        </CardTitle>
                        <CardDescription>
                            Your recent health information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-emerald-50 rounded-lg">
                                <Heart className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                                <p className="text-sm font-medium">Blood Pressure</p>
                                <p className="text-lg font-bold text-emerald-700">120/80</p>
                                <p className="text-xs text-emerald-600">Normal</p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                <p className="text-sm font-medium">Weight</p>
                                <p className="text-lg font-bold text-blue-700">70 kg</p>
                                <p className="text-xs text-blue-600">Stable</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <Bell className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                                <p className="text-sm font-medium">Next Checkup</p>
                                <p className="text-lg font-bold text-purple-700">Due</p>
                                <p className="text-xs text-purple-600">In 2 weeks</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <User className="mr-2 h-5 w-5 text-blue-600" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription>
                            Manage your healthcare easily
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Button className="flex flex-col items-center p-4 h-auto">
                                <Calendar className="h-6 w-6 mb-2" />
                                <span className="text-xs">Book Appointment</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <FileText className="h-6 w-6 mb-2" />
                                <span className="text-xs">View Records</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Pill className="h-6 w-6 mb-2" />
                                <span className="text-xs">Prescriptions</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <CreditCard className="h-6 w-6 mb-2" />
                                <span className="text-xs">Pay Bills</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}