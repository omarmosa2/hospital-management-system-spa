import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Save, ArrowLeft, User, Phone, MapPin, Heart, Shield } from 'lucide-react';

export default function CreatePatient() {
    const { data, setData, post, processing, errors } = useForm({
        // Personal Information
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        emergency_contact: '',
        emergency_phone: '',
        address: '',

        // Medical Information
        blood_type: '',
        height_cm: '',
        weight_kg: '',
        allergies: '',
        medical_conditions: '',
        current_medications: '',

        // Insurance Information
        insurance_provider: '',
        insurance_number: '',
        policy_holder: '',

        // Administrative
        primary_doctor_id: '',
        preferred_clinic_id: '',
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/patients');
    };

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Patients
                    </Button>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Register New Patient
                    </h2>
                </div>
            }
        >
            <Head title="Register Patient" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="mr-2 h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                                <CardDescription>
                                    Basic patient identification and contact details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="first_name">First Name *</Label>
                                        <Input
                                            id="first_name"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            className={errors.first_name ? 'border-red-500' : ''}
                                        />
                                        {errors.first_name && (
                                            <p className="text-sm text-red-600 mt-1">{errors.first_name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="middle_name">Middle Name</Label>
                                        <Input
                                            id="middle_name"
                                            value={data.middle_name}
                                            onChange={(e) => setData('middle_name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="last_name">Last Name *</Label>
                                        <Input
                                            id="last_name"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            className={errors.last_name ? 'border-red-500' : ''}
                                        />
                                        {errors.last_name && (
                                            <p className="text-sm text-red-600 mt-1">{errors.last_name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="date_of_birth">Date of Birth *</Label>
                                        <Input
                                            id="date_of_birth"
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                            className={errors.date_of_birth ? 'border-red-500' : ''}
                                        />
                                        {errors.date_of_birth && (
                                            <p className="text-sm text-red-600 mt-1">{errors.date_of_birth}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="gender">Gender</Label>
                                        <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {genderOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className={errors.phone ? 'border-red-500' : ''}
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="emergency_phone">Emergency Contact Phone *</Label>
                                        <Input
                                            id="emergency_phone"
                                            value={data.emergency_phone}
                                            onChange={(e) => setData('emergency_phone', e.target.value)}
                                            className={errors.emergency_phone ? 'border-red-500' : ''}
                                        />
                                        {errors.emergency_phone && (
                                            <p className="text-sm text-red-600 mt-1">{errors.emergency_phone}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="emergency_contact">Emergency Contact Name *</Label>
                                    <Input
                                        id="emergency_contact"
                                        value={data.emergency_contact}
                                        onChange={(e) => setData('emergency_contact', e.target.value)}
                                        className={errors.emergency_contact ? 'border-red-500' : ''}
                                    />
                                    {errors.emergency_contact && (
                                        <p className="text-sm text-red-600 mt-1">{errors.emergency_contact}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Medical Information */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Heart className="mr-2 h-5 w-5" />
                                    Medical Information
                                </CardTitle>
                                <CardDescription>
                                    Patient's medical history and vital statistics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="blood_type">Blood Type</Label>
                                        <Select value={data.blood_type} onValueChange={(value) => setData('blood_type', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select blood type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bloodTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="height_cm">Height (cm)</Label>
                                        <Input
                                            id="height_cm"
                                            type="number"
                                            value={data.height_cm}
                                            onChange={(e) => setData('height_cm', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="weight_kg">Weight (kg)</Label>
                                        <Input
                                            id="weight_kg"
                                            type="number"
                                            step="0.1"
                                            value={data.weight_kg}
                                            onChange={(e) => setData('weight_kg', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="allergies">Allergies</Label>
                                    <Textarea
                                        id="allergies"
                                        value={data.allergies}
                                        onChange={(e) => setData('allergies', e.target.value)}
                                        placeholder="List any known allergies..."
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="medical_conditions">Medical Conditions</Label>
                                    <Textarea
                                        id="medical_conditions"
                                        value={data.medical_conditions}
                                        onChange={(e) => setData('medical_conditions', e.target.value)}
                                        placeholder="Current and past medical conditions..."
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="current_medications">Current Medications</Label>
                                    <Textarea
                                        id="current_medications"
                                        value={data.current_medications}
                                        onChange={(e) => setData('current_medications', e.target.value)}
                                        placeholder="Current medications and dosages..."
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Insurance Information */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Shield className="mr-2 h-5 w-5" />
                                    Insurance Information
                                </CardTitle>
                                <CardDescription>
                                    Insurance coverage details (optional)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="insurance_provider">Insurance Provider</Label>
                                        <Input
                                            id="insurance_provider"
                                            value={data.insurance_provider}
                                            onChange={(e) => setData('insurance_provider', e.target.value)}
                                            placeholder="e.g., Blue Cross"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="insurance_number">Policy Number</Label>
                                        <Input
                                            id="insurance_number"
                                            value={data.insurance_number}
                                            onChange={(e) => setData('insurance_number', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="policy_holder">Policy Holder</Label>
                                        <Input
                                            id="policy_holder"
                                            value={data.policy_holder}
                                            onChange={(e) => setData('policy_holder', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Administrative */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Administrative Settings</CardTitle>
                                <CardDescription>
                                    Patient assignment and status settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="primary_doctor_id">Primary Doctor</Label>
                                        <Select value={data.primary_doctor_id} onValueChange={(value) => setData('primary_doctor_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Assign primary doctor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* Doctor options would be loaded dynamically */}
                                                <SelectItem value="1">Dr. Smith</SelectItem>
                                                <SelectItem value="2">Dr. Johnson</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="preferred_clinic_id">Preferred Clinic</Label>
                                        <Select value={data.preferred_clinic_id} onValueChange={(value) => setData('preferred_clinic_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select preferred clinic" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* Clinic options would be loaded dynamically */}
                                                <SelectItem value="1">General Medicine</SelectItem>
                                                <SelectItem value="2">Cardiology</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active">Patient is active</Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Registering...' : 'Register Patient'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}