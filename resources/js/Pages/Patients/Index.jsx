import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Users, Search, Plus, Filter, MoreHorizontal,
    Phone, Mail, Calendar, MapPin, Eye
} from 'lucide-react';

export default function PatientsIndex({ patients, auth }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Ensure patients is always an array
    const patientsArray = Array.isArray(patients) ? patients : (patients?.data ? patients.data : []);

    const filteredPatients = patientsArray.filter(patient =>
        patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patient_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Role-based permissions
    const userRole = auth.user.role;
    const canCreatePatients = userRole === 'reception';
    const canEditPatients = userRole === 'reception';
    const canDeletePatients = userRole === 'reception';
    const isReadOnly = userRole === 'admin';
    const showPageForDoctor = userRole !== 'doctor';

    // If doctor tries to access this page, show access denied
    if (!showPageForDoctor) {
        return (
            <AuthenticatedLayout
                header={
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                Access Denied
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                You don't have permission to access this page
                            </p>
                        </div>
                    </div>
                }
            >
                <Head title="Access Denied" />
                <Card>
                    <CardContent className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Access Restricted
                        </h3>
                        <p className="text-gray-500">
                            Doctors do not have access to patient management pages.
                        </p>
                    </CardContent>
                </Card>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Patients Management
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {isReadOnly ? 'View patient records and information (Admin Access)' : 'Manage patient records and information'}
                        </p>
                    </div>
                    {auth.user.role === 'reception' && (
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Patient
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="Patients" />

            <div className="space-y-6">
                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center">
                                    <Users className="mr-2 h-5 w-5 text-blue-600" />
                                    All Patients
                                </CardTitle>
                                <CardDescription>
                                    {filteredPatients.length} patients found {isReadOnly && '- Admin can only view patient records'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search patients..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button variant="outline">
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Patients Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.map((patient) => (
                        <Card key={patient.id} className="hover:shadow-lg transition-shadow duration-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-blue-700">
                                                {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">
                                                {patient.first_name} {patient.last_name}
                                            </CardTitle>
                                            <p className="text-sm text-gray-500">
                                                {patient.patient_id}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="h-4 w-4 mr-2" />
                                    {patient.phone}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Mail className="h-4 w-4 mr-2" />
                                    {patient.email || 'No email provided'}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {patient.blood_type || 'Blood type not specified'}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t">
                                    <div className="flex space-x-2">
                                        <Badge
                                            className={
                                                patient.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }
                                        >
                                            {patient.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="outline">
                                            <Eye className="mr-1 h-3 w-3" />
                                            View
                                        </Button>
                                        {auth.user.role === 'reception' && (
                                            <Button size="sm">
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredPatients.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No patients found
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm ? 'Try adjusting your search terms.' : isReadOnly ? 'No patients in the system yet.' : 'Get started by adding your first patient.'}
                            </p>
                            {!searchTerm && canCreatePatients && (
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New Patient
                                </Button>
                            )}
                            {!searchTerm && isReadOnly && (
                                <Badge variant="outline">Admin View Only</Badge>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}