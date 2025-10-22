import React, { useState, useEffect } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Users, Calendar, FileText, Clock, CheckCircle, AlertCircle,
    Stethoscope, Pill, Activity, TrendingUp
} from 'lucide-react';

export default function DoctorDashboard() {
    const { auth, stats } = usePage().props;
    const [dashboardData, setDashboardData] = useState({
        todayAppointments: 0,
        totalPatients: 0,
        pendingRecords: 0,
        completedToday: 0,
        upcomingAppointments: 0,
        monthlyConsultations: 0
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
            description: 'Scheduled for today',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'My Patients',
            value: dashboardData.totalPatients,
            icon: Users,
            description: 'Total patients under care',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Pending Records',
            value: dashboardData.pendingRecords,
            icon: FileText,
            description: 'Records awaiting completion',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            title: 'Completed Today',
            value: dashboardData.completedToday,
            icon: CheckCircle,
            description: 'Consultations completed',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50'
        },
        {
            title: 'Upcoming',
            value: dashboardData.upcomingAppointments,
            icon: Clock,
            description: 'Next 7 days appointments',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'This Month',
            value: dashboardData.monthlyConsultations,
            icon: TrendingUp,
            description: 'Consultations this month',
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
                            Doctor Dashboard
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Welcome back, Dr. {auth.user.name}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Available
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
            <Head title="Doctor Dashboard" />

            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">
                                Good morning, Dr. {auth.user.name}! 👨‍⚕️
                            </h1>
                            <p className="text-green-100 mb-4">
                                Ready for another day of caring for patients.
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>{dashboardData.todayAppointments} appointments today</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    <span>{dashboardData.completedToday} completed yesterday</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-center">
                                    <Stethoscope className="h-8 w-8 mx-auto mb-2 text-white" />
                                    <div className="text-lg font-bold">
                                        {dashboardData.totalPatients}
                                    </div>
                                    <div className="text-xs text-green-100">
                                        Total Patients
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
                    {/* Today's Schedule */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                                Today's Schedule
                            </CardTitle>
                            <CardDescription>
                                Your appointments for today
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">9:00 AM - John Doe</p>
                                        <p className="text-xs text-gray-500">General Consultation</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                                </div>
                                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">11:00 AM - Sarah Johnson</p>
                                        <p className="text-xs text-gray-500">Follow-up Visit</p>
                                    </div>
                                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">2:00 PM - Mike Wilson</p>
                                        <p className="text-xs text-gray-500">Routine Check-up</p>
                                    </div>
                                    <Badge variant="outline">Scheduled</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Tasks */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertCircle className="mr-2 h-5 w-5 text-orange-600" />
                                Pending Tasks
                            </CardTitle>
                            <CardDescription>
                                Records and tasks requiring attention
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                                    <FileText className="h-4 w-4 text-orange-600 mr-3" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Complete John Doe's record</p>
                                        <p className="text-xs text-gray-500">From yesterday's consultation</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                    <Pill className="h-4 w-4 text-blue-600 mr-3" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Review lab results</p>
                                        <p className="text-xs text-gray-500">Sarah Johnson's blood work</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                                    <Activity className="h-4 w-4 text-purple-600 mr-3" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Update treatment plan</p>
                                        <p className="text-xs text-gray-500">Mike Wilson's hypertension</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Stethoscope className="mr-2 h-5 w-5 text-green-600" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription>
                            Common tasks for patient care
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link href={route('doctor.patients.index')}>
                            <Button className="flex flex-col items-center p-4 h-auto">
                                <Users className="h-6 w-6 mb-2" />
                                <span className="text-xs">مرضاي</span>
                            </Button>
                        </Link>
                        <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                            <Calendar className="h-6 w-6 mb-2" />
                            <span className="text-xs">المواعيد</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                            <FileText className="h-6 w-6 mb-2" />
                            <span className="text-xs">السجلات</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                            <Pill className="h-6 w-6 mb-2" />
                            <span className="text-xs">الوصفات</span>
                        </Button>
                    </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}