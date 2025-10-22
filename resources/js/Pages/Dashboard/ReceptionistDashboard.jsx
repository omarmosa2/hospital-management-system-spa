import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Users, Calendar, Phone, Clock, CheckCircle, AlertCircle,
    Building, UserPlus, CalendarCheck, TrendingUp, PhoneCall
} from 'lucide-react';

export default function ReceptionistDashboard() {
    const { auth, stats } = usePage().props;
    const [dashboardData, setDashboardData] = useState({
        todayAppointments: 0,
        newPatients: 0,
        pendingCheckIns: 0,
        completedCheckIns: 0,
        waitingPatients: 0,
        phoneCalls: 0
    });

    useEffect(() => {
        if (stats) {
            setDashboardData(stats);
        }
    }, [stats]);

    const statCards = [
        {
            title: 'Today\'s Appointments',
            value: dashboardData.todayAppointments,
            icon: Calendar,
            description: 'Total scheduled',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'New Patients',
            value: dashboardData.newPatients,
            icon: UserPlus,
            description: 'Registered today',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Pending Check-ins',
            value: dashboardData.pendingCheckIns,
            icon: Clock,
            description: 'Awaiting check-in',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            title: 'Completed Check-ins',
            value: dashboardData.completedCheckIns,
            icon: CheckCircle,
            description: 'Checked in today',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50'
        },
        {
            title: 'Waiting Patients',
            value: dashboardData.waitingPatients,
            icon: Users,
            description: 'In waiting area',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Phone Inquiries',
            value: dashboardData.phoneCalls,
            icon: PhoneCall,
            description: 'Calls handled today',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
        }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Reception Dashboard
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Welcome back, {auth.user.name}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge className="bg-green-100 text-green-800">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Front Desk
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
            <Head title="Receptionist Dashboard" />

            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">
                                Good morning, {auth.user.name}! 👋
                            </h1>
                            <p className="text-purple-100 mb-4">
                                Managing appointments and patient services with excellence.
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>{dashboardData.todayAppointments} appointments today</span>
                                </div>
                                <div className="flex items-center">
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    <span>{dashboardData.newPatients} new patients</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-center">
                                    <Phone className="h-8 w-8 mx-auto mb-2 text-white" />
                                    <div className="text-lg font-bold">
                                        {dashboardData.waitingPatients}
                                    </div>
                                    <div className="text-xs text-purple-100">
                                        Waiting Now
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
                    {/* Today's Appointments */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                                Today's Appointments
                            </CardTitle>
                            <CardDescription>
                                Scheduled appointments for today
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">9:00 AM - John Doe</p>
                                        <p className="text-xs text-gray-500">Dr. Smith - General Medicine</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">Checked In</Badge>
                                </div>
                                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">10:00 AM - Sarah Johnson</p>
                                        <p className="text-xs text-gray-500">Dr. Smith - Follow-up</p>
                                    </div>
                                    <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>
                                </div>
                                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">11:00 AM - Mike Wilson</p>
                                        <p className="text-xs text-gray-500">Dr. Davis - Cardiology</p>
                                    </div>
                                    <Badge className="bg-orange-100 text-orange-800">Arrived</Badge>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">2:00 PM - Lisa Brown</p>
                                        <p className="text-xs text-gray-500">Dr. Smith - Consultation</p>
                                    </div>
                                    <Badge variant="outline">Scheduled</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Patient Check-in */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <UserPlus className="mr-2 h-5 w-5 text-green-600" />
                                Patient Check-in
                            </CardTitle>
                            <CardDescription>
                                Patients waiting for check-in
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-xs font-medium text-green-700">JD</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">John Doe</p>
                                        <p className="text-xs text-gray-500">Appointment at 9:00 AM</p>
                                    </div>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                        Check In
                                    </Button>
                                </div>
                                <div className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-xs font-medium text-orange-700">MW</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Mike Wilson</p>
                                        <p className="text-xs text-gray-500">Appointment at 11:00 AM</p>
                                    </div>
                                    <Button size="sm" variant="outline">
                                        Waiting
                                    </Button>
                                </div>
                                <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-xs font-medium text-blue-700">LB</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Lisa Brown</p>
                                        <p className="text-xs text-gray-500">Appointment at 2:00 PM</p>
                                    </div>
                                    <Button size="sm" variant="outline" disabled>
                                        Not Arrived
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Building className="mr-2 h-5 w-5 text-purple-600" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription>
                            Common reception tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <Link href={route('patients.create')}>
                                <Button className="flex flex-col items-center p-4 h-auto">
                                    <UserPlus className="h-6 w-6 mb-2" />
                                    <span className="text-xs">إضافة مريض</span>
                                </Button>
                            </Link>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Calendar className="h-6 w-6 mb-2" />
                                <span className="text-xs">حجز موعد</span>
                            </Button>
                            <Link href={route('patients.index')}>
                                <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                    <Users className="h-6 w-6 mb-2" />
                                    <span className="text-xs">قائمة المرضى</span>
                                </Button>
                            </Link>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Phone className="h-6 w-6 mb-2" />
                                <span className="text-xs">Contact</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <TrendingUp className="h-6 w-6 mb-2" />
                                <span className="text-xs">Reports</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Waiting Area Status */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Users className="mr-2 h-5 w-5 text-indigo-600" />
                            Waiting Area Status
                        </CardTitle>
                        <CardDescription>
                            Current waiting room situation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-700">
                                    {dashboardData.waitingPatients}
                                </div>
                                <p className="text-sm text-blue-600">Patients Waiting</p>
                                <div className="mt-2 text-xs text-gray-500">
                                    Average wait: 15 min
                                </div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-700">
                                    {dashboardData.completedCheckIns}
                                </div>
                                <p className="text-sm text-green-600">Checked In Today</p>
                                <div className="mt-2 text-xs text-gray-500">
                                    {Math.round((dashboardData.completedCheckIns / dashboardData.todayAppointments) * 100)}% of total
                                </div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-700">
                                    {dashboardData.todayAppointments - dashboardData.completedCheckIns}
                                </div>
                                <p className="text-sm text-purple-600">Remaining Today</p>
                                <div className="mt-2 text-xs text-gray-500">
                                    Next: 11:00 AM
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}