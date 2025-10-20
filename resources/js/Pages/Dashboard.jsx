import React, { useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AdminDashboard from './Dashboard/AdminDashboard';
import DoctorDashboard from './Dashboard/DoctorDashboard';
import NurseDashboard from './Dashboard/NurseDashboard';
import PatientDashboard from './Dashboard/PatientDashboard';
import ReceptionistDashboard from './Dashboard/ReceptionistDashboard';

export default function Dashboard() {
    const { auth } = usePage().props;

    // Route users to their appropriate dashboard based on their primary role
    const getDashboardComponent = () => {
        // Handle case where user has no role assigned
        if (!auth.user.role) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="mb-4">
                            <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Role Assignment Required</h2>
                        <p className="text-gray-600 mb-4">
                            Your account has been created successfully, but a role has not been assigned yet.
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Please contact your system administrator to assign you an appropriate role (Admin, Doctor, Nurse, Patient, or Receptionist).
                        </p>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Account Details:</strong><br />
                                Email: {auth.user.email}<br />
                                Status: Active (awaiting role assignment)
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        // Route to appropriate dashboard based on role
        switch (auth.user.role.name) {
            case 'admin':
                return <AdminDashboard />;
            case 'doctor':
                return <DoctorDashboard />;
            case 'nurse':
                return <NurseDashboard />;
            case 'patient':
                return <PatientDashboard />;
            case 'receptionist':
                return <ReceptionistDashboard />;
            default:
                return (
                    <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unrecognized Role</h2>
                            <p className="text-gray-600 mb-4">
                                Your role ({auth.user.role.display_name}) is not recognized by the system.
                            </p>
                            <p className="text-sm text-gray-500">
                                Please contact your system administrator for assistance.
                            </p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <Head title={`${auth.user.role?.display_name || 'User'} Dashboard`} />
            {getDashboardComponent()}
        </>
    );
}
