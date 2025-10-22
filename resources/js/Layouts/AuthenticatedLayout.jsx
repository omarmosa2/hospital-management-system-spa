import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Home,
    Users,
    UserCheck,
    Calendar,
    FileText,
    Pill,
    CreditCard,
    BarChart3,
    Settings,
    Stethoscope,
    Building,
    ClipboardList,
    Bell,
    Shield,
    Menu,
    X,
    ChevronDown,
    LogOut,
    Moon,
    Sun
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
    };

    // Navigation items based on user role
    const getNavigationItems = () => {
        const commonItems = [
            { name: 'Dashboard', href: 'dashboard', icon: Home, current: route().current('dashboard') }
        ];

        const roleBasedItems = {
            admin: [
                { name: 'العيادات', href: 'clinics.index', icon: Building },
                { name: 'الأطباء', href: 'doctors.index', icon: Stethoscope },
                { name: 'Patients', href: 'patients.index', icon: Users },
                { name: 'Appointments', href: 'appointments.index', icon: Calendar },
                { name: 'System Settings', href: 'dashboard', icon: Settings },
                { name: 'Reports', href: 'dashboard', icon: ClipboardList },
            ],
            doctor: [
                { name: 'My Patients', href: 'patients.index', icon: Users },
                { name: 'Appointments', href: 'appointments.index', icon: Calendar },
                { name: 'Medical Records', href: 'dashboard', icon: FileText },
                { name: 'Prescriptions', href: 'dashboard', icon: Pill },
            ],
            patient: [
                { name: 'My Appointments', href: 'appointments.index', icon: Calendar },
                { name: 'Medical Records', href: 'dashboard', icon: FileText },
                { name: 'Prescriptions', href: 'dashboard', icon: Pill },
                { name: 'Bills', href: 'dashboard', icon: CreditCard },
            ],
            receptionist: [
                { name: 'Patients', href: 'patients.index', icon: Users },
                { name: 'Appointments', href: 'appointments.index', icon: Calendar },
                { name: 'Schedule', href: 'dashboard', icon: Stethoscope },
                { name: 'Reports', href: 'dashboard', icon: Building },
            ],
            nurse: [
                { name: 'Patients', href: 'patients.index', icon: Users },
                { name: 'Appointments', href: 'appointments.index', icon: Calendar },
                { name: 'Medical Records', href: 'dashboard', icon: FileText },
                { name: 'Vital Signs', href: 'dashboard', icon: FileText },
            ]
        };

        return [...commonItems, ...(roleBasedItems[user.role?.name] || [])];
    };

    const navigationItems = getNavigationItems();

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-background'}`}>
            {/* Sidebar */}
            <div className={`fixed inset-y-0 right-0 z-50 w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? '-translate-x-0' : 'translate-x-full'}`}>
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className={`flex h-16 items-center justify-between px-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <Link href="/" className="flex items-center space-x-2">
                            <ApplicationLogo className="h-8 w-8 text-primary" />
                            <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-darkText'}`}>نظام المستشفى</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className={`lg:hidden p-2 rounded-md ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-darkText'}`}>
                                    {user.name}
                                </p>
                                <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {user.role?.display_name || user.role?.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={route(item.href)}
                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                        item.current
                                            ? `bg-primary/10 text-primary border-l-2 border-primary`
                                            : `${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
                                    }`}
                                >
                                    <Icon className={`ml-3 h-5 w-5 ${item.current ? 'text-primary' : `${darkMode ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-400 group-hover:text-gray-600'}`}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Section */}
                    <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                                    <Settings className="ml-3 h-4 w-4" />
                                    الإعدادات
                                    <ChevronDown className="mr-auto h-4 w-4" />
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>
                                    إعدادات الملف الشخصي
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    <div className="flex items-center">
                                        <LogOut className="ml-2 h-4 w-4" />
                                        تسجيل الخروج
                                    </div>
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
<div className="lg:pr-64">
{/* Top header */}
<header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-b border-gray-200`}>
    <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
            <h1 className={`mr-2 text-lg font-semibold lg:mr-0 ${darkMode ? 'text-white' : 'text-darkText'}`}>
                {header || 'لوحة التحكم'}
            </h1>
            <button
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden p-2 rounded-md ml-2 ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            >
                <Menu className="h-5 w-5" />
            </button>
        </div>

        <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <button className={`p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
                <Bell className="h-5 w-5" />
            </button>

            {/* User dropdown */}
            <Dropdown>
                <Dropdown.Trigger>
                    <button className={`flex items-center space-x-2 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <span className={`hidden md:block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                            {user.name}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>
                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="max-w-7xl mx-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
