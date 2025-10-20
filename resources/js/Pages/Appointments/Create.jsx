import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Calendar } from '@/Components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { Badge } from '@/Components/ui/badge';
import {
    Calendar as CalendarIcon, Clock, Save, ArrowLeft,
    User, Stethoscope, MapPin, FileText
} from 'lucide-react';
import { format } from 'date-fns';

export default function CreateAppointment() {
    const { doctors, clinics, patients } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        doctor_id: '',
        clinic_id: '',
        scheduled_datetime: '',
        appointment_type: 'consultation',
        duration_minutes: 30,
        reason_for_visit: '',
        symptoms: '',
        notes: '',
    });

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);

    useEffect(() => {
        if (data.doctor_id && selectedDate) {
            // Fetch available slots for selected doctor and date
            fetchAvailableSlots(data.doctor_id, selectedDate);
        }
    }, [data.doctor_id, selectedDate]);

    const fetchAvailableSlots = async (doctorId, date) => {
        // This would make an API call to get available slots
        // For now, we'll simulate some time slots
        const slots = [];
        const startHour = 9; // 9 AM
        const endHour = 17; // 5 PM

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(timeString);
            }
        }

        setAvailableSlots(slots);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedTime('');
        const dateTimeString = format(date, 'yyyy-MM-dd');
        setData('scheduled_datetime', '');
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        if (selectedDate) {
            const dateTimeString = `${format(selectedDate, 'yyyy-MM-dd')} ${time}:00`;
            setData('scheduled_datetime', dateTimeString);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/appointments');
    };

    const appointmentTypes = [
        { value: 'consultation', label: 'General Consultation' },
        { value: 'follow_up', label: 'Follow-up Visit' },
        { value: 'emergency', label: 'Emergency Visit' },
        { value: 'routine_check', label: 'Routine Check-up' },
        { value: 'vaccination', label: 'Vaccination' },
        { value: 'other', label: 'Other' }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Appointments
                    </Button>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Schedule New Appointment
                    </h2>
                </div>
            }
        >
            <Head title="Schedule Appointment" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        {/* Patient Selection */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="mr-2 h-5 w-5" />
                                    Patient Information
                                </CardTitle>
                                <CardDescription>
                                    Select the patient for this appointment
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="patient_id">Patient *</Label>
                                        <Select value={data.patient_id} onValueChange={(value) => setData('patient_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a patient" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {patients?.map((patient) => (
                                                    <SelectItem key={patient.id} value={patient.id.toString()}>
                                                        {patient.first_name} {patient.last_name} (ID: {patient.patient_id})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.patient_id && (
                                            <p className="text-sm text-red-600 mt-1">{errors.patient_id}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="clinic_id">Preferred Clinic</Label>
                                        <Select value={data.clinic_id} onValueChange={(value) => setData('clinic_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select clinic" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clinics?.map((clinic) => (
                                                    <SelectItem key={clinic.id} value={clinic.id.toString()}>
                                                        {clinic.name} - {clinic.location}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Doctor and Time Selection */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Stethoscope className="mr-2 h-5 w-5" />
                                    Doctor & Schedule
                                </CardTitle>
                                <CardDescription>
                                    Choose the healthcare provider and appointment time
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="doctor_id">Doctor *</Label>
                                        <Select value={data.doctor_id} onValueChange={(value) => setData('doctor_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a doctor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {doctors?.map((doctor) => (
                                                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                        {doctor.user.name} - {doctor.specialization}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.doctor_id && (
                                            <p className="text-sm text-red-600 mt-1">{errors.doctor_id}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="appointment_type">Appointment Type</Label>
                                        <Select value={data.appointment_type} onValueChange={(value) => setData('appointment_type', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {appointmentTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Date Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Select Date *</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={`w-full justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedDate}
                                                    onSelect={handleDateSelect}
                                                    disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.scheduled_datetime && (
                                            <p className="text-sm text-red-600 mt-1">{errors.scheduled_datetime}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                                        <Select value={data.duration_minutes.toString()} onValueChange={(value) => setData('duration_minutes', parseInt(value))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15">15 minutes</SelectItem>
                                                <SelectItem value="30">30 minutes</SelectItem>
                                                <SelectItem value="45">45 minutes</SelectItem>
                                                <SelectItem value="60">1 hour</SelectItem>
                                                <SelectItem value="90">1.5 hours</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Time Slots */}
                                {selectedDate && data.doctor_id && availableSlots.length > 0 && (
                                    <div>
                                        <Label>Available Time Slots</Label>
                                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-2">
                                            {availableSlots.map((slot) => (
                                                <Button
                                                    key={slot}
                                                    type="button"
                                                    variant={selectedTime === slot ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handleTimeSelect(slot)}
                                                    className="text-xs"
                                                >
                                                    {slot}
                                                </Button>
                                            ))}
                                        </div>
                                        {errors.scheduled_datetime && (
                                            <p className="text-sm text-red-600 mt-1">Please select a time slot</p>
                                        )}
                                    </div>
                                )}

                                {selectedDate && data.doctor_id && availableSlots.length === 0 && (
                                    <div className="text-center py-4 text-gray-500">
                                        <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                        <p>No available slots for this date</p>
                                        <p className="text-sm">Please select a different date</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Appointment Details */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="mr-2 h-5 w-5" />
                                    Appointment Details
                                </CardTitle>
                                <CardDescription>
                                    Reason for visit and additional notes
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="reason_for_visit">Reason for Visit *</Label>
                                    <Textarea
                                        id="reason_for_visit"
                                        value={data.reason_for_visit}
                                        onChange={(e) => setData('reason_for_visit', e.target.value)}
                                        placeholder="Brief description of why the patient needs to see the doctor..."
                                        rows={3}
                                        className={errors.reason_for_visit ? 'border-red-500' : ''}
                                    />
                                    {errors.reason_for_visit && (
                                        <p className="text-sm text-red-600 mt-1">{errors.reason_for_visit}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="symptoms">Symptoms</Label>
                                    <Textarea
                                        id="symptoms"
                                        value={data.symptoms}
                                        onChange={(e) => setData('symptoms', e.target.value)}
                                        placeholder="Describe any symptoms the patient is experiencing..."
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Any additional information or special requirements..."
                                        rows={2}
                                    />
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
                                {processing ? 'Scheduling...' : 'Schedule Appointment'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}