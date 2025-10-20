import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { UserPlus, Mail, Lock, Eye, EyeOff, User, Shield, Stethoscope, Heart } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'patient', // Default role
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const roleOptions = [
        {
            value: 'patient',
            label: 'Patient',
            description: 'Access to personal health records and appointments',
            icon: Heart,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50'
        },
        {
            value: 'doctor',
            label: 'Doctor',
            description: 'Medical professional with patient care access',
            icon: Stethoscope,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            value: 'nurse',
            label: 'Nurse',
            description: 'Nursing staff with patient coordination access',
            icon: User,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            value: 'receptionist',
            label: 'Receptionist',
            description: 'Front desk staff with scheduling access',
            icon: Shield,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            value: 'admin',
            label: 'Administrator',
            description: 'Full system access and management',
            icon: Shield,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        }
    ];

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                    <UserPlus className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-600">Join HospitalMS and manage healthcare efficiently</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Full Name" className="text-gray-700 font-medium" />
                    <div className="mt-1 relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-gray-700 font-medium" />
                    <div className="mt-1 relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Enter your email address"
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel value="Account Type" className="text-gray-700 font-medium mb-3 block" />
                    <div className="grid grid-cols-1 gap-3">
                        {roleOptions.map((role) => {
                            const Icon = role.icon;
                            return (
                                <label
                                    key={role.value}
                                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                        data.role === role.value
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value={role.value}
                                        checked={data.role === role.value}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${role.bgColor}`}>
                                        <Icon className={`h-5 w-5 ${role.color}`} />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <div className="font-medium text-gray-900">{role.label}</div>
                                        <div className="text-sm text-gray-500">{role.description}</div>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        data.role === role.value
                                            ? 'border-purple-500 bg-purple-500'
                                            : 'border-gray-300'
                                    }`}>
                                        {data.role === role.value && (
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                    <InputError message={errors.role} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-gray-700 font-medium" />
                    <div className="mt-1 relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="pl-10 pr-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Create a strong password"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className="text-gray-700 font-medium"
                    />
                    <div className="mt-1 relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="password_confirmation"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="pl-10 pr-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <PrimaryButton
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105"
                    disabled={processing}
                >
                    {processing ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating account...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <UserPlus className="mr-2 h-5 w-5" />
                            Create HospitalMS Account
                        </div>
                    )}
                </PrimaryButton>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                        href={route('login')}
                        className="font-medium text-purple-600 hover:text-purple-500 transition duration-200"
                    >
                        Sign in here
                    </Link>
                </p>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 text-center">
                    <strong>Note:</strong> After registration, you'll receive an email verification link.
                    Contact your administrator for role assignment if needed.
                </p>
            </div>
        </GuestLayout>
    );
}
