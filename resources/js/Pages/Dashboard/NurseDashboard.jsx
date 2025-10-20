import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Users, Calendar, FileText, Clock, CheckCircle, AlertCircle,
    Heart, Activity, TrendingUp, UserCheck, Stethoscope
} from 'lucide-react';

export default function NurseDashboard() {
    const { auth, stats } = usePage().props;
    const [dashboardData, setDashboardData] = useState({
        todayVitals: 0,
        pendingTasks: 0,
        completedToday: 0,
        patientRounds: 0,
        upcomingRounds: 0,
        alertsCount: 0
    });

    useEffect(() => {
        if (stats) {
            setDashboardData(stats);
        }
    }, [stats]);

    const statCards = [
        {
            title: 'Today\'s Vitals',
            value: dashboardData.todayVitals,
            icon: Heart,
            description: 'Vital signs recorded',
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        },
        {
            title: 'Pending Tasks',
            value: dashboardData.pendingTasks,
            icon: Clock,
            description: 'Tasks awaiting completion',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            title: 'Completed Today',
            value: dashboardData.completedToday,
            icon: CheckCircle,
            description: 'Tasks completed',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Patient Rounds',
            value: dashboardData.patientRounds,
            icon: Users,
            description: 'Patients checked today',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Upcoming Rounds',
            value: dashboardData.upcomingRounds,
            icon: Calendar,
            description: 'Scheduled patient visits',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Active Alerts',
            value: dashboardData.alertsCount,
            icon: AlertCircle,
            description: 'Require attention',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Nurse Dashboard
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Welcome back, {auth.user.name}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge className="bg-blue-100 text-blue-800">
                            <Activity className="w-3 h-3 mr-1" />
                            On Duty
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
            <Head title="Nurse Dashboard" />

            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">
                                Good morning, {auth.user.name}! 👩‍⚕️
                            </h1>
                            <p className="text-blue-100 mb-4">
                                Ready to provide excellent patient care today.
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    <span>{dashboardData.patientRounds} patient rounds completed</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    <span>{dashboardData.completedToday} tasks finished</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-center">
                                    <Heart className="h-8 w-8 mx-auto mb-2 text-white" />
                                    <div className="text-lg font-bold">
                                        {dashboardData.todayVitals}
                                    </div>
                                    <div className="text-xs text-blue-100">
                                        Vitals Recorded
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
                                Your patient care schedule
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">8:00 AM - Room 101</p>
                                        <p className="text-xs text-gray-500">Morning vital signs round</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">In Progress</Badge>
                                </div>
                                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">10:00 AM - Room 205</p>
                                        <p className="text-xs text-gray-500">Patient assessment - Mr. Johnson</p>
                                    </div>
                                    <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">2:00 PM - Emergency Ward</p>
                                        <p className="text-xs text-gray-500">Post-op patient monitoring</p>
                                    </div>
                                    <Badge variant="outline">Pending</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Patient Alerts */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertCircle className="mr-2 h-5 w-5 text-orange-600" />
                                Patient Alerts
                            </CardTitle>
                            <CardDescription>
                                Patients requiring immediate attention
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                                    <AlertCircle className="h-4 w-4 text-red-600 mr-3" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">High temperature alert</p>
                                        <p className="text-xs text-gray-500">Room 203 - Sarah Johnson</p>
                                    </div>
                                    <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                                </div>
                                <div className="flex items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                                    <Clock className="h-4 w-4 text-yellow-600 mr-3" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Medication due</p>
                                        <p className="text-xs text-gray-500">Room 105 - John Doe</p>
                                    </div>
                                    <Badge className="bg-yellow-100 text-yellow-800">Soon</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="mr-2 h-5 w-5 text-blue-600" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription>
                            Common nursing tasks and tools
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Button className="flex flex-col items-center p-4 h-auto">
                                <Heart className="h-6 w-6 mb-2" />
                                <span className="text-xs">Record Vitals</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Users className="h-6 w-6 mb-2" />
                                <span className="text-xs">Patient List</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <FileText className="h-6 w-6 mb-2" />
                                <span className="text-xs">Patient Records</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Stethoscope className="h-6 w-6 mb-2" />
                                <span className="text-xs">Rounds</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}