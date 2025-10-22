import React, { useState, useEffect } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
    Users, Calendar, FileText, DollarSign, Activity, Settings, TrendingUp, Clock,
    CheckCircle, AlertCircle, Stethoscope, Pill, User, Shield, Eye, EyeOff,
    RefreshCw, LogOut, UserCheck
} from 'lucide-react';

export default function UnifiedDashboard() {
    const { auth, stats, activityLogs, permissions } = usePage().props;
    const [currentTab, setCurrentTab] = useState('overview');
    const [selectedRole, setSelectedRole] = useState(null);
    const [isRoleSwitching, setIsRoleSwitching] = useState(false);
    const [realTimeUpdates, setRealTimeUpdates] = useState({});

    const userRoles = auth.user.roles || [];
    const primaryRole = userRoles.length > 0 ? userRoles[0] : null;

    // Check permissions
    const hasPermission = (permission) => {
        return permissions && permissions.includes(permission);
    };

    const canView = (section) => {
        switch (section) {
            case 'patients':
                return hasPermission('view-patients');
            case 'doctors':
                return hasPermission('view-doctors');
            case 'clinics':
                return hasPermission('view-clinics');
            case 'appointments':
                return hasPermission('view-appointments');
            case 'reports':
                return hasPermission('view-reports');
            case 'payments':
                return hasPermission('view-payments');
            case 'salaries':
                return hasPermission('view-salaries');
            case 'my-salary':
                return hasPermission('view-my-salary');
            default:
                return true;
        }
    };

    // Real-time updates simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setRealTimeUpdates(prev => ({
                ...prev,
                lastUpdate: new Date().toLocaleTimeString()
            }));
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, []);

    // Role switching for testing (admin only)
    const switchRole = async (roleId) => {
        if (!hasPermission('admin')) return;

        setIsRoleSwitching(true);
        try {
            await router.post('/admin/switch-role', { role_id: roleId }, {
                onSuccess: () => {
                    window.location.reload();
                }
            });
        } catch (error) {
            console.error('Role switch failed:', error);
        } finally {
            setIsRoleSwitching(false);
        }
    };

    // Get dashboard stats based on role
    const getStatsForRole = (role) => {
        if (!stats) return {};

        switch (role) {
            case 'admin':
                return stats.admin || {};
            case 'doctor':
                return stats.doctor || {};
            case 'receptionist':
                return stats.receptionist || {};
            case 'patient':
                return stats.patient || {};
            default:
                return {};
        }
    };

    const currentStats = getStatsForRole(primaryRole?.name);

    // Common stat cards
    const getStatCards = (role) => {
        const baseCards = [];

        if (canView('patients')) {
            baseCards.push({
                title: 'Total Patients',
                value: currentStats.totalPatients || 0,
                icon: Users,
                description: 'Registered patients',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50'
            });
        }

        if (canView('appointments')) {
            baseCards.push({
                title: 'Today\'s Appointments',
                value: currentStats.todayAppointments || 0,
                icon: Calendar,
                description: 'Scheduled for today',
                color: 'text-green-600',
                bgColor: 'bg-green-50'
            });
        }

        if (role === 'doctor') {
            baseCards.push(
                {
                    title: 'My Patients',
                    value: currentStats.myPatients || 0,
                    icon: User,
                    description: 'Under my care',
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-50'
                },
                {
                    title: 'Pending Records',
                    value: currentStats.pendingRecords || 0,
                    icon: FileText,
                    description: 'Awaiting completion',
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50'
                }
            );
        }

        if (role === 'admin' && canView('payments')) {
            baseCards.push({
                title: 'Monthly Revenue',
                value: `$${currentStats.totalRevenue || 0}`,
                icon: DollarSign,
                description: 'This month',
                color: 'text-emerald-600',
                bgColor: 'bg-emerald-50'
            });
        }

        if (role === 'patient') {
            baseCards.push({
                title: 'My Appointments',
                value: currentStats.myAppointments || 0,
                icon: Calendar,
                description: 'Upcoming visits',
                color: 'text-indigo-600',
                bgColor: 'bg-indigo-50'
            });
        }

        return baseCards;
    };

    // Activity logging
    const logActivity = (action, details) => {
        router.post('/api/activity-log', {
            action,
            details,
            user_id: auth.user.id,
            role: primaryRole?.name
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            لوحة التحكم الرئيسية
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            مرحباً، {auth.user.name} ({primaryRole?.display_name})
                            {realTimeUpdates.lastUpdate && (
                                <span className="ml-2 text-xs text-green-600">
                                    <RefreshCw className="inline h-3 w-3 mr-1" />
                                    آخر تحديث: {realTimeUpdates.lastUpdate}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {hasPermission('admin') && (
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedRole(selectedRole ? null : primaryRole)}
                                    disabled={isRoleSwitching}
                                >
                                    {isRoleSwitching ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Shield className="h-4 w-4 mr-1" />
                                    )}
                                    تبديل الدور
                                </Button>
                                {selectedRole && (
                                    <select
                                        className="text-sm border rounded px-2 py-1"
                                        onChange={(e) => switchRole(e.target.value)}
                                    >
                                        <option value="">اختر دوراً...</option>
                                        {userRoles.map(role => (
                                            <option key={role.id} value={role.id}>
                                                {role.display_name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            النظام نشط
                        </Badge>
                    </div>
                </div>
            }
        >
            <Head title="Main Dashboard" />

            <div className="space-y-6">
                {/* Role-based Welcome Section */}
                <div className={`bg-gradient-to-r rounded-xl p-6 text-white ${
                    primaryRole?.name === 'admin' ? 'from-purple-600 to-blue-600' :
                    primaryRole?.name === 'doctor' ? 'from-green-600 to-teal-600' :
                    primaryRole?.name === 'receptionist' ? 'from-orange-600 to-red-600' :
                    primaryRole?.name === 'patient' ? 'from-blue-600 to-indigo-600' :
                    'from-gray-600 to-gray-700'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">
                                {primaryRole?.name === 'admin' ? '👑 مرحباً مدير النظام' :
                                 primaryRole?.name === 'doctor' ? '👨‍⚕️ مرحباً دكتور' :
                                 primaryRole?.name === 'receptionist' ? '📋 مرحباً موظف الاستقبال' :
                                 primaryRole?.name === 'patient' ? '🏥 مرحباً بالمريض' :
                                 'مرحباً'}
                                {auth.user.name}!
                            </h1>
                            <p className="text-white/90 mb-4">
                                {primaryRole?.name === 'admin' ? 'إدارة النظام والمستخدمين' :
                                 primaryRole?.name === 'doctor' ? 'إدارة المرضى والحالات الطبية' :
                                 primaryRole?.name === 'receptionist' ? 'إدارة المواعيد والمرضى' :
                                 primaryRole?.name === 'patient' ? 'متابعة مواعيدك وحالتك الصحية' :
                                 'وصول إلى النظام'}
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span>آخر دخول: {new Date().toLocaleDateString('ar-SA')}</span>
                                </div>
                                <div className="flex items-center">
                                    <Activity className="h-4 w-4 mr-1" />
                                    <span>الحالة: نشط</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold">
                                        {currentStats.todayAppointments || 0}
                                    </div>
                                    <div className="text-xs text-white/80">
                                        {primaryRole?.name === 'doctor' ? 'مواعيد اليوم' :
                                         primaryRole?.name === 'patient' ? 'مواعيدك' :
                                         'إجمالي المواعيد'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Tabs */}
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview" className="flex items-center">
                            <Activity className="h-4 w-4 mr-2" />
                            نظرة عامة
                        </TabsTrigger>
                        {canView('patients') && (
                            <TabsTrigger value="patients" className="flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                المرضى
                            </TabsTrigger>
                        )}
                        {canView('appointments') && (
                            <TabsTrigger value="appointments" className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                المواعيد
                            </TabsTrigger>
                        )}
                        {canView('reports') && (
                            <TabsTrigger value="reports" className="flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                التقارير
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="profile" className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            الملف الشخصي
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {getStatCards(primaryRole?.name).map((stat, index) => (
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

                        {/* Content Grid based on role */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Activity */}
                            <Card className="hover:shadow-lg transition-shadow duration-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Activity className="mr-2 h-5 w-5 text-blue-600" />
                                        الأنشطة الأخيرة
                                    </CardTitle>
                                    <CardDescription>
                                        آخر الأنشطة في النظام
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {activityLogs && activityLogs.slice(0, 5).map((log, index) => (
                                            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                <Badge className="mr-2" variant="outline">
                                                    {log.action}
                                                </Badge>
                                                <span className="text-sm text-gray-600 flex-1">
                                                    {log.description}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(log.created_at).toLocaleDateString('ar-SA')}
                                                </span>
                                            </div>
                                        ))}
                                        {!activityLogs && (
                                            <div className="text-center py-4">
                                                <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-500">لا توجد أنشطة حديثة</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="hover:shadow-lg transition-shadow duration-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <TrendingUp className="mr-2 h-5 w-5 text-indigo-600" />
                                        الإجراءات السريعة
                                    </CardTitle>
                                    <CardDescription>
                                        المهام الشائعة حسب دورك
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3">
                                        {primaryRole?.name === 'doctor' && (
                                            <>
                                                <Link href={route('doctor.patients.index')}>
                                                    <Button className="flex flex-col items-center p-4 h-auto w-full">
                                                        <Users className="h-6 w-6 mb-2" />
                                                        <span className="text-xs">مرضاي</span>
                                                    </Button>
                                                </Link>
                                                <Link href={route('appointments.index')}>
                                                    <Button variant="outline" className="flex flex-col items-center p-4 h-auto w-full">
                                                        <Calendar className="h-6 w-6 mb-2" />
                                                        <span className="text-xs">المواعيد</span>
                                                    </Button>
                                                </Link>
                                            </>
                                        )}

                                        {primaryRole?.name === 'admin' && (
                                            <>
                                                <Link href={route('patients.index')}>
                                                    <Button className="flex flex-col items-center p-4 h-auto w-full">
                                                        <Users className="h-6 w-6 mb-2" />
                                                        <span className="text-xs">المرضى</span>
                                                    </Button>
                                                </Link>
                                                <Link href={route('reports.index')}>
                                                    <Button variant="outline" className="flex flex-col items-center p-4 h-auto w-full">
                                                        <FileText className="h-6 w-6 mb-2" />
                                                        <span className="text-xs">التقارير</span>
                                                    </Button>
                                                </Link>
                                            </>
                                        )}

                                        {primaryRole?.name === 'receptionist' && (
                                            <>
                                                <Link href={route('patients.create')}>
                                                    <Button className="flex flex-col items-center p-4 h-auto w-full">
                                                        <User className="h-6 w-6 mb-2" />
                                                        <span className="text-xs">مريض جديد</span>
                                                    </Button>
                                                </Link>
                                                <Link href={route('appointments.index')}>
                                                    <Button variant="outline" className="flex flex-col items-center p-4 h-auto w-full">
                                                        <Calendar className="h-6 w-6 mb-2" />
                                                        <span className="text-xs">جدولة</span>
                                                    </Button>
                                                </Link>
                                            </>
                                        )}

                                        {primaryRole?.name === 'patient' && (
                                            <>
                                                <Link href={route('profile.edit')}>
                                                    <Button className="flex flex-col items-center p-4 h-auto w-full">
                                                        <User className="h-6 w-6 mb-2" />
                                                        <span className="text-xs">ملفي</span>
                                                    </Button>
                                                </Link>
                                                <Button variant="outline" className="flex flex-col items-center p-4 h-auto w-full">
                                                    <Calendar className="h-6 w-6 mb-2" />
                                                    <span className="text-xs">مواعيدي</span>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Patients Tab */}
                    {canView('patients') && (
                        <TabsContent value="patients" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>إدارة المرضى</CardTitle>
                                    <CardDescription>
                                        {primaryRole?.name === 'doctor' ? 'المرضى تحت إشرافك الطبي' : 'جميع المرضى المسجلين'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8">
                                        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">إدارة المرضى</h3>
                                        <p className="text-gray-500 mb-4">
                                            {primaryRole?.name === 'doctor' ? 'يمكنك الوصول إلى ملفات مرضاك من هنا' : 'إدارة جميع بيانات المرضى'}
                                        </p>
                                        <Link href={primaryRole?.name === 'doctor' ? route('doctor.patients.index') : route('patients.index')}>
                                            <Button>
                                                <Users className="h-4 w-4 mr-2" />
                                                عرض المرضى
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Appointments Tab */}
                    {canView('appointments') && (
                        <TabsContent value="appointments" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>إدارة المواعيد</CardTitle>
                                    <CardDescription>
                                        {primaryRole?.name === 'doctor' ? 'مواعيدك الطبية' :
                                         primaryRole?.name === 'patient' ? 'مواعيدك المجدولة' :
                                         'جدولة وإدارة المواعيد'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8">
                                        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">إدارة المواعيد</h3>
                                        <p className="text-gray-500 mb-4">
                                            {primaryRole?.name === 'doctor' ? 'إدارة مواعيد المرضى' :
                                             primaryRole?.name === 'patient' ? 'متابعة مواعيدك الطبية' :
                                             'جدولة المواعيد والحجوزات'}
                                        </p>
                                        <Link href={route('appointments.index')}>
                                            <Button>
                                                <Calendar className="h-4 w-4 mr-2" />
                                                عرض المواعيد
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Reports Tab - Admin only */}
                    {canView('reports') && (
                        <TabsContent value="reports" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>التقارير والإحصائيات</CardTitle>
                                    <CardDescription>
                                        تقارير مفصلة عن أداء النظام والخدمات
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8">
                                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">التقارير</h3>
                                        <p className="text-gray-500 mb-4">
                                            إنشاء وتصدير التقارير المالية والطبية
                                        </p>
                                        <Link href={route('reports.index')}>
                                            <Button>
                                                <FileText className="h-4 w-4 mr-2" />
                                                عرض التقارير
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>الملف الشخصي</CardTitle>
                                <CardDescription>
                                    إدارة معلوماتك الشخصية والحساب
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-gray-100 rounded-full p-3">
                                            <User className="h-8 w-8 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium">{auth.user.name}</h3>
                                            <p className="text-gray-500">{auth.user.email}</p>
                                            <Badge variant="outline" className="mt-1">
                                                {primaryRole?.display_name}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="border-t pt-4">
                                        <Link href={route('profile.edit')}>
                                            <Button variant="outline">
                                                <User className="h-4 w-4 mr-2" />
                                                تعديل الملف الشخصي
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}