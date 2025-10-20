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
    LogOut
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

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
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
                        <Link href="/" className="flex items-center space-x-2">
                            <ApplicationLogo className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900">HospitalMS</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
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
                                            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon className={`mr-3 h-5 w-5 ${item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Section */}
                    <div className="p-4 border-t border-gray-200">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                    <Settings className="mr-3 h-4 w-4" />
                                    Settings
                                    <ChevronDown className="ml-auto h-4 w-4" />
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profile Settings
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    <div className="flex items-center">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log Out
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
            <div className="lg:pl-64">
                {/* Top header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <h1 className="ml-2 text-lg font-semibold text-gray-900 lg:ml-0">
                                {header || 'Dashboard'}
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                <Bell className="h-5 w-5" />
                            </button>

                            {/* User dropdown */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-white">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="hidden md:block text-sm font-medium text-gray-700">
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
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
