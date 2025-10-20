import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
    FileText, Download, TrendingUp, Users, Calendar,
    DollarSign, Activity, BarChart3, PieChart, FileSpreadsheet,
    Printer, Filter, Search, Eye
} from 'lucide-react';

export default function AdminReportsIndex({ reports }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');

    const handleExport = (format) => {
        // Handle export functionality
        console.log(`Exporting report in ${format} format`);
        // In a real implementation, this would trigger a download
    };

    const reportStats = [
        {
            title: 'Total Patients',
            value: '1,234',
            change: '+12%',
            icon: Users,
            color: 'text-blue-600'
        },
        {
            title: 'Appointments Today',
            value: '89',
            change: '+5%',
            icon: Calendar,
            color: 'text-green-600'
        },
        {
            title: 'Revenue This Month',
            value: '$45,678',
            change: '+18%',
            icon: DollarSign,
            color: 'text-emerald-600'
        },
        {
            title: 'Active Doctors',
            value: '23',
            change: '+2',
            icon: Activity,
            color: 'text-purple-600'
        }
    ];

    const recentReports = [
        {
            id: 1,
            name: 'Monthly Patient Report',
            type: 'Patient Analytics',
            date: '2024-01-15',
            status: 'completed'
        },
        {
            id: 2,
            name: 'Financial Summary',
            type: 'Revenue Report',
            date: '2024-01-14',
            status: 'completed'
        },
        {
            id: 3,
            name: 'Doctor Performance',
            type: 'Staff Analytics',
            date: '2024-01-13',
            status: 'processing'
        }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Reports & Analytics
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            View and export hospital reports (Admin Access)
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" onClick={() => handleExport('pdf')}>
                            <Download className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleExport('excel')}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export Excel
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Reports - Admin" />

            <div className="space-y-6">
                {/* Report Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {reportStats.map((stat, index) => (
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
                                    <span className="text-green-600">{stat.change}</span> from last month
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Reports Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="patients">Patients</TabsTrigger>
                        <TabsTrigger value="financial">Financial</TabsTrigger>
                        <TabsTrigger value="staff">Staff</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Visual Reports */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
                                        Monthly Overview
                                    </CardTitle>
                                    <CardDescription>
                                        Patient visits and appointments over time
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                        <div className="text-center">
                                            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Chart visualization would go here</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Reports */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="mr-2 h-5 w-5 text-green-600" />
                                        Recent Reports
                                    </CardTitle>
                                    <CardDescription>
                                        Latest generated reports and their status
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentReports.map((report) => (
                                            <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{report.name}</p>
                                                    <p className="text-xs text-gray-500">{report.type}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={
                                                        report.status === 'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }>
                                                        {report.status}
                                                    </Badge>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="patients" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Patient Analytics</CardTitle>
                                <CardDescription>
                                    Detailed patient statistics and demographics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Patient demographics chart</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="financial" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Financial Reports</CardTitle>
                                <CardDescription>
                                    Revenue, expenses, and financial projections
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Financial trends chart</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="staff" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Staff Performance</CardTitle>
                                <CardDescription>
                                    Doctor and staff productivity metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Staff performance metrics</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Export Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Download className="mr-2 h-5 w-5 text-blue-600" />
                            Export Options
                        </CardTitle>
                        <CardDescription>
                            Export reports in various formats for external use
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto" onClick={() => handleExport('excel')}>
                                <FileSpreadsheet className="h-8 w-8 mb-2 text-green-600" />
                                <span className="text-sm">Excel</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto" onClick={() => handleExport('pdf')}>
                                <FileText className="h-8 w-8 mb-2 text-red-600" />
                                <span className="text-sm">PDF</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto" onClick={() => handleExport('csv')}>
                                <FileText className="h-8 w-8 mb-2 text-blue-600" />
                                <span className="text-sm">CSV</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Printer className="h-8 w-8 mb-2 text-gray-600" />
                                <span className="text-sm">Print</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}