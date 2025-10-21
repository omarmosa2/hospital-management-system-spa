import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { Stethoscope, Heart, Shield, Users } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <div className="flex min-h-screen flex-col items-center justify-center p-6">
                <div className="w-full max-w-md">
                    {/* Logo and Title */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
                            <Stethoscope className="h-8 w-8 text-white" />
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">HospitalMS</h1>
                        <p className="text-gray-600">Advanced Hospital Management System</p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="flex items-center p-3 bg-white/50 backdrop-blur-sm rounded-lg">
                            <Heart className="h-5 w-5 text-red-500 mr-2" />
                            <span className="text-sm text-gray-700">Patient Care</span>
                        </div>
                        <div className="flex items-center p-3 bg-white/50 backdrop-blur-sm rounded-lg">
                            <Shield className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm text-gray-700">Secure</span>
                        </div>
                        <div className="flex items-center p-3 bg-white/50 backdrop-blur-sm rounded-lg">
                            <Users className="h-5 w-5 text-blue-500 mr-2" />
                            <span className="text-sm text-gray-700">Multi-Role</span>
                        </div>
                        <div className="flex items-center p-3 bg-white/50 backdrop-blur-sm rounded-lg">
                            <Stethoscope className="h-5 w-5 text-purple-500 mr-2" />
                            <span className="text-sm text-gray-700">Healthcare</span>
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
                        {children}
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-500">
                            © 2026 HospitalMS. Built with ❤️ for healthcare professionals.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
