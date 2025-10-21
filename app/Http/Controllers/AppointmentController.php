<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Clinic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Check if user has permission to view appointments
        if (!$user->hasPermission('view-appointments')) {
            abort(403, 'Unauthorized access to appointments management.');
        }

        // For doctors, only show their own appointments
        if ($user->isDoctor()) {
            $doctor = $user->doctor;
            if (!$doctor) {
                abort(403, 'Doctor profile not found.');
            }

            $query = Appointment::with(['patient.user', 'doctor.user', 'clinic'])
                ->where('doctor_id', $doctor->id);
        } else {
            // For receptionists and admins, show all appointments
            $query = Appointment::with(['patient.user', 'doctor.user', 'clinic']);
        }

        $query->when($request->search, function ($q) use ($request) {
                $q->whereHas('patient', function ($patientQuery) use ($request) {
                    $patientQuery->where('first_name', 'like', '%' . $request->search . '%')
                                ->orWhere('last_name', 'like', '%' . $request->search . '%');
                })
                ->orWhereHas('doctor.user', function ($doctorQuery) use ($request) {
                    $doctorQuery->where('name', 'like', '%' . $request->search . '%');
                })
                ->orWhere('appointment_number', 'like', '%' . $request->search . '%');
            })
            ->when($request->status && $request->status !== 'all', function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->when($request->type && $request->type !== 'all', function ($q) use ($request) {
                $q->where('appointment_type', $request->type);
            })
            ->when($request->date_filter && $request->date_filter !== 'all', function ($q) use ($request) {
                switch ($request->date_filter) {
                    case 'today':
                        $q->whereDate('scheduled_datetime', today());
                        break;
                    case 'tomorrow':
                        $q->whereDate('scheduled_datetime', today()->addDay());
                        break;
                    case 'week':
                        $q->whereBetween('scheduled_datetime', [now(), now()->addWeek()]);
                        break;
                    case 'overdue':
                        $q->where('scheduled_datetime', '<', now())
                          ->whereNotIn('status', ['completed', 'cancelled']);
                        break;
                }
            })
            ->orderBy('scheduled_datetime', 'asc');

        $appointments = $query->paginate(15);

        return Inertia::render('Appointments/Index', [
            'appointments' => $appointments,
            'filters' => $request->only(['search', 'status', 'type', 'date_filter']),
            'can' => [
                'create' => $user->hasPermission('create-appointments'),
                'edit' => $user->hasPermission('edit-appointments'),
                'delete' => $user->hasPermission('delete-appointments'),
                'manage_status' => $user->hasPermission('manage-appointment-status'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();

        // Check if user has permission to create appointments
        if (!$user->hasPermission('create-appointments')) {
            abort(403, 'Unauthorized to create appointments.');
        }

        $doctors = Doctor::with(['user', 'clinic'])
            ->where('is_available', true)
            ->get();

        $clinics = Clinic::where('is_active', true)->get();
        $patients = Patient::where('is_active', true)->get();

        return Inertia::render('Appointments/Create', [
            'doctors' => $doctors,
            'clinics' => $clinics,
            'patients' => $patients
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Check if user has permission to create appointments
        if (!$user->hasPermission('create-appointments')) {
            abort(403, 'Unauthorized to create appointments.');
        }

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:doctors,id',
            'clinic_id' => 'nullable|exists:clinics,id',
            'scheduled_datetime' => 'required|date|after:now',
            'appointment_type' => 'required|in:consultation,follow_up,emergency,routine_check,vaccination,other',
            'visit_type' => 'required|in:consultation,follow_up',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'reason_for_visit' => 'required|string|max:1000',
            'symptoms' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:1000',
            'base_consultation_fee' => 'required|numeric|min:0',
            'amount_received' => 'required|numeric|min:0',
            'center_discount' => 'nullable|numeric|min:0',
            'doctor_discount' => 'nullable|numeric|min:0',
            'additional_procedures_amount' => 'nullable|numeric|min:0',
            'additional_procedures' => 'nullable|string',
            'is_first_visit_free' => 'boolean',
        ]);

        // Check if doctor is available at the requested time
        $doctor = Doctor::findOrFail($validated['doctor_id']);
        $appointmentDateTime = new \DateTime($validated['scheduled_datetime']);

        if (!$doctor->isAvailableAt($appointmentDateTime)) {
            return back()->withErrors(['scheduled_datetime' => 'Doctor is not available at the selected time.']);
        }

        // Check for conflicting appointments
        $conflict = Appointment::where('doctor_id', $validated['doctor_id'])
            ->where('scheduled_datetime', '<', date('Y-m-d H:i:s', strtotime($validated['scheduled_datetime'] . ' +' . $validated['duration_minutes'] . ' minutes')))
            ->where('scheduled_datetime', '>', date('Y-m-d H:i:s', strtotime($validated['scheduled_datetime'] . ' -' . $validated['duration_minutes'] . ' minutes')))
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->exists();

        if ($conflict) {
            return back()->withErrors(['scheduled_datetime' => 'This time slot conflicts with another appointment.']);
        }

        // Generate appointment number
        $appointmentNumber = 'APT-' . date('Ymd') . '-' . str_pad(Appointment::count() + 1, 4, '0', STR_PAD_LEFT);

        $appointment = Appointment::create(array_merge($validated, [
            'appointment_number' => $appointmentNumber,
            'scheduled_by' => Auth::id(),
            'end_datetime' => date('Y-m-d H:i:s', strtotime($validated['scheduled_datetime'] . ' +' . $validated['duration_minutes'] . ' minutes')),
        ]));

        // Calculate financial fields
        $appointment->updateFinancialCalculations();

        return redirect()->route('appointments.show', $appointment)->with('success', 'Appointment scheduled successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Appointment $appointment)
    {
        $appointment->load(['patient.user', 'doctor.user', 'clinic', 'scheduledBy', 'medicalRecord']);

        return Inertia::render('Appointments/Show', [
            'appointment' => $appointment
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Appointment $appointment)
    {
        $user = Auth::user();

        // Check if user has permission to edit appointments or is the assigned doctor
        if (!$user->hasPermission('edit-appointments') && !($user->isDoctor() && $appointment->doctor->user_id === $user->id)) {
            abort(403, 'Unauthorized to edit this appointment.');
        }

        $doctors = Doctor::with(['user', 'clinic'])->where('is_available', true)->get();
        $clinics = Clinic::where('is_active', true)->get();

        return Inertia::render('Appointments/Edit', [
            'appointment' => $appointment->load(['patient.user', 'doctor.user', 'clinic']),
            'doctors' => $doctors,
            'clinics' => $clinics
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Appointment $appointment)
    {
        $user = Auth::user();

        // Check if user has permission to edit appointments or is the assigned doctor
        if (!$user->hasPermission('edit-appointments') && !($user->isDoctor() && $appointment->doctor->user_id === $user->id)) {
            abort(403, 'Unauthorized to edit this appointment.');
        }

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:doctors,id',
            'clinic_id' => 'nullable|exists:clinics,id',
            'scheduled_datetime' => 'required|date|after:now',
            'appointment_type' => 'required|in:consultation,follow_up,emergency,routine_check,vaccination,other',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'reason_for_visit' => 'required|string|max:1000',
            'symptoms' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:1000',
            'status' => 'required|in:scheduled,confirmed,checked_in,in_progress,completed,cancelled,no_show',
        ]);

        // Check if doctor is available at the requested time (excluding current appointment)
        $doctor = Doctor::findOrFail($validated['doctor_id']);
        $appointmentDateTime = new \DateTime($validated['scheduled_datetime']);

        if (!$doctor->isAvailableAt($appointmentDateTime)) {
            return back()->withErrors(['scheduled_datetime' => 'Doctor is not available at the selected time.']);
        }

        // Check for conflicting appointments (excluding current appointment)
        $conflict = Appointment::where('doctor_id', $validated['doctor_id'])
            ->where('id', '!=', $appointment->id)
            ->where('scheduled_datetime', '<', date('Y-m-d H:i:s', strtotime($validated['scheduled_datetime'] . ' +' . $validated['duration_minutes'] . ' minutes')))
            ->where('scheduled_datetime', '>', date('Y-m-d H:i:s', strtotime($validated['scheduled_datetime'] . ' -' . $validated['duration_minutes'] . ' minutes')))
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->exists();

        if ($conflict) {
            return back()->withErrors(['scheduled_datetime' => 'This time slot conflicts with another appointment.']);
        }

        $validated['end_datetime'] = date('Y-m-d H:i:s', strtotime($validated['scheduled_datetime'] . ' +' . $validated['duration_minutes'] . ' minutes'));

        $appointment->update($validated);

        return redirect()->route('appointments.show', $appointment)->with('success', 'Appointment updated successfully');
    }

    /**
     * Update appointment status.
     */
    public function updateStatus(Request $request, Appointment $appointment)
    {
        $user = Auth::user();

        // Check if user has permission to manage appointment status or is the assigned doctor
        if (!$user->hasPermission('manage-appointment-status') && !($user->isDoctor() && $appointment->doctor->user_id === $user->id)) {
            abort(403, 'Unauthorized to update appointment status.');
        }

        $validated = $request->validate([
            'status' => 'required|in:scheduled,confirmed,checked_in,in_progress,completed,cancelled,no_show',
            'notes' => 'nullable|string|max:1000',
        ]);

        $appointment->update($validated);

        // Set specific timestamps based on status
        if ($validated['status'] === 'checked_in' && !$appointment->checked_in_at) {
            $appointment->update(['checked_in_at' => now()]);
        } elseif ($validated['status'] === 'completed' && !$appointment->completed_at) {
            $appointment->update(['completed_at' => now()]);
        } elseif ($validated['status'] === 'cancelled' && !$appointment->cancelled_at) {
            $appointment->update(['cancelled_at' => now()]);
        }

        return redirect()->back()->with('success', 'Appointment status updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $appointment)
    {
        $user = Auth::user();

        // Check if user has permission to delete appointments
        if (!$user->hasPermission('delete-appointments')) {
            abort(403, 'Unauthorized to delete appointments.');
        }

        $appointment->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => 'Cancelled by administrator'
        ]);

        return redirect()->route('appointments.index')->with('success', 'Appointment cancelled successfully');
    }

    /**
     * Get available time slots for a doctor on a specific date.
     */
    public function getAvailableSlots(Request $request)
    {
        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'date' => 'required|date|after_or_equal:today',
        ]);

        $doctor = Doctor::findOrFail($validated['doctor_id']);
        $slots = $doctor->getAvailableSlots($validated['date']);

        return response()->json(['slots' => $slots]);
    }
}
