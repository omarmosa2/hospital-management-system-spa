import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Building, Search, Filter, Eye, MapPin, Phone, Clock, User
} from 'lucide-react';

export default function ReceptionClinicsIndex({ clinics }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Ensure clinics is always an array
    const clinicsArray = Array.isArray(clinics) ? clinics : (clinics?.data ? clinics.data : []);

    const filteredClinics = clinicsArray.filter(clinic =>
        clinic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.clinic_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Clinics Directory
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            View available clinics (Reception Access - View Only)
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Clinics - Reception" />

            <div className="space-y-6">
                {/* Info Card */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center">
                            <Building className="h-5 w-5 text-blue-600 mr-3" />
                            <div>
                                <p className="font-medium text-blue-900">Clinics are managed by administrators</p>
                                <p className="text-sm text-blue-700">Contact your administrator to add or modify clinic information</p>
                            </div>
                        </div>
                    </Card>
                </Card>

                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center">
                                    <Building className="mr-2 h-5 w-5 text-blue-600" />
                                    Available Clinics (View Only)
                                </CardTitle>
                                <CardDescription>
                                    {filteredClinics.length} clinics found - Reception can only view clinic information
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search clinics..."
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

                {/* Clinics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClinics.map((clinic) => (
                        <Card key={clinic.id} className="hover:shadow-lg transition-shadow duration-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Building className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">
                                                {clinic.name}
                                            </CardTitle>
                                            <p className="text-sm text-gray-500">
                                                {clinic.clinic_id}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">View Only</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {clinic.address || 'Address not specified'}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="h-4 w-4 mr-2" />
                                    {clinic.phone || 'Phone not specified'}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Hours: {clinic.operating_hours || 'Not specified'}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <User className="h-4 w-4 mr-2" />
                                    Head: {clinic.head_doctor || 'Not assigned'}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t">
                                    <div className="flex space-x-2">
                                        <Badge
                                            className={
                                                clinic.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }
                                        >
                                            {clinic.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="outline">
                                            <Eye className="mr-1 h-3 w-3" />
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredClinics.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No clinics found
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm ? 'Try adjusting your search terms.' : 'No clinics have been added yet.'}
                            </p>
                            <Badge variant="outline">Clinics are managed by administrators</Badge>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}