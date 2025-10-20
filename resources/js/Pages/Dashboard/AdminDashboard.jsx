import React, { useState, useEffect } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Users, Calendar, FileText, DollarSign, Activity, Settings, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
    const { auth, stats } = usePage().props;
    const [dashboardData, setDashboardData] = useState({
        totalUsers: 0,
        totalAppointments: 0,
        totalPatients: 0,
        totalDoctors: 0,
        totalRevenue: 0,
        systemHealth: 'good'
    });

    useEffect(() => {
        if (stats) {
            setDashboardData(stats);
        }
    }, [stats]);

    const statCards = [
        {
            title: 'Total Users',
            value: dashboardData.totalUsers,
            icon: Users,
            description: 'Registered users in system',
            color: 'text-blue-600'
        },
        {
            title: 'Appointments Today',
            value: dashboardData.totalAppointments,
            icon: Calendar,
            description: 'Scheduled appointments',
            color: 'text-green-600'
        },
        {
            title: 'Active Patients',
            value: dashboardData.totalPatients,
            icon: Activity,
            description: 'Patients in the system',
            color: 'text-purple-600'
        },
        {
            title: 'Medical Staff',
            value: dashboardData.totalDoctors,
            icon: Users,
            description: 'Doctors and nurses',
            color: 'text-orange-600'
        },
        {
            title: 'Monthly Revenue',
            value: `$${dashboardData.totalRevenue}`,
            icon: DollarSign,
            description: 'Revenue this month',
            color: 'text-emerald-600'
        },
        {
            title: 'System Health',
            value: dashboardData.systemHealth === 'good' ? 'Excellent' : 'Good',
            icon: Settings,
            description: 'System performance',
            color: 'text-teal-600'
        }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Admin Dashboard
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Welcome back, {auth.user.name}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            System Online
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
                            <p className="text-xs text-gray-500">
                                {new Date().toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">
                                Good morning, {auth.user.name}! 👋
                            </h1>
                            <p className="text-blue-100 mb-4">
                                Here's what's happening with your hospital today.
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span>Last login: Today 9:00 AM</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    <span>All systems operational</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold">
                                        {dashboardData.totalAppointments}
                                    </div>
                                    <div className="text-sm text-blue-100">
                                        Today's Appointments
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {statCards.map((stat, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
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

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Activity className="mr-2 h-5 w-5 text-blue-600" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription>
                                Latest system activities and updates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                    <Badge className="mr-2 bg-green-100 text-green-800">New Patient</Badge>
                                    <span className="text-sm text-gray-600 flex-1">
                                        John Doe registered as a new patient
                                    </span>
                                    <span className="text-xs text-gray-400">2 hours ago</span>
                                </div>
                                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                    <Badge className="mr-2 bg-blue-100 text-blue-800">Appointment</Badge>
                                    <span className="text-sm text-gray-600 flex-1">
                                        Dr. Smith completed consultation with Sarah Johnson
                                    </span>
                                    <span className="text-xs text-gray-400">4 hours ago</span>
                                </div>
                                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                                    <Badge className="mr-2 bg-yellow-100 text-yellow-800">Payment</Badge>
                                    <span className="text-sm text-gray-600 flex-1">
                                        Payment received for appointment #12345
                                    </span>
                                    <span className="text-xs text-gray-400">6 hours ago</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Overview */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Settings className="mr-2 h-5 w-5 text-purple-600" />
                                System Overview
                            </CardTitle>
                            <CardDescription>
                                Hospital system status and information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Database Status</span>
                                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Active Sessions</span>
                                    <span className="text-sm font-medium">24 users</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Server Load</span>
                                    <span className="text-sm font-medium">45%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Last Backup</span>
                                    <span className="text-sm font-medium">2 hours ago</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Action Buttons */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingUp className="mr-2 h-5 w-5 text-indigo-600" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription>
                            Common administrative tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            <Button className="flex flex-col items-center p-4 h-auto">
                                <Users className="h-6 w-6 mb-2" />
                                <span className="text-xs">Manage Users</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Calendar className="h-6 w-6 mb-2" />
                                <span className="text-xs">Appointments</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <FileText className="h-6 w-6 mb-2" />
                                <span className="text-xs">Reports</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <DollarSign className="h-6 w-6 mb-2" />
                                <span className="text-xs">Financial</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Settings className="h-6 w-6 mb-2" />
                                <span className="text-xs">Settings</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}