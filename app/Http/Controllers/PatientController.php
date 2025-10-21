<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Patient::with(['user', 'primaryDoctor.user', 'preferredClinic'])
            ->when($request->search, function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('last_name', 'like', '%' . $request->search . '%')
                  ->orWhere('patient_id', 'like', '%' . $request->search . '%');
            })
            ->when($request->status && $request->status !== 'all', function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active');
            })
            ->when($request->clinic && $request->clinic !== 'all', function ($q) use ($request) {
                $q->where('preferred_clinic_id', $request->clinic);
            })
            ->orderBy('created_at', 'desc');

        $patients = $query->paginate(15);

        return Inertia::render('Patients/Index', [
            'patients' => $patients,
            'filters' => $request->only(['search', 'status', 'clinic'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $doctors = \App\Models\Doctor::with('user')->where('is_available', true)->get();
        $clinics = \App\Models\Clinic::where('is_active', true)->get();

        return Inertia::render('Patients/Create', [
            'doctors' => $doctors,
            'clinics' => $clinics
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Personal Information
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:male,female,other',
            'phone' => 'required|string|max:255|unique:patients,phone',
            'emergency_contact' => 'required|string|max:255',
            'emergency_phone' => 'required|string|max:255',
            'address' => 'nullable|string',

            // Medical Information
            'blood_type' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'height_cm' => 'nullable|numeric|min:50|max:300',
            'weight_kg' => 'nullable|numeric|min:1|max:500',
            'allergies' => 'nullable|string',
            'medical_conditions' => 'nullable|string',
            'current_medications' => 'nullable|string',

            // Insurance Information
            'insurance_provider' => 'nullable|string|max:255',
            'insurance_number' => 'nullable|string|max:255',
            'policy_holder' => 'nullable|string|max:255',

            // Administrative
            'primary_doctor_id' => 'nullable|exists:doctors,id',
            'preferred_clinic_id' => 'nullable|exists:clinics,id',
            'is_active' => 'boolean',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                // Create user account for patient
                $user = User::create([
                    'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                    'email' => strtolower($validated['first_name'] . '.' . $validated['last_name'] . '.' . time() . '@patient.hospital.local'), // Generate temporary email
                    'password' => Hash::make('patient123'), // Default password
                ]);

                // Assign patient role
                $patientRole = Role::where('name', 'patient')->first();
                if ($patientRole) {
                    $user->role()->associate($patientRole);
                    $user->save();
                }

                // Generate unique patient ID
                $patientId = 'PAT-' . date('Y') . '-' . str_pad(Patient::count() + 1, 6, '0', STR_PAD_LEFT);

                // Create patient record
                $patient = Patient::create(array_merge($validated, [
                    'user_id' => $user->id,
                    'patient_id' => $patientId,
                    'first_visit_date' => now(),
                    'last_visit_date' => now(),
                ]));

                return redirect()->route('patients.show', $patient)->with('success', 'Patient registered successfully');
            });
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to register patient. Please try again.']);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Patient $patient)
    {
        $patient->load([
            'user',
            'primaryDoctor.user',
            'preferredClinic',
            'appointments' => function ($query) {
                $query->latest()->limit(10);
            },
            'medicalRecords' => function ($query) {
                $query->latest()->limit(10);
            },
            'prescriptions' => function ($query) {
                $query->where('status', 'active')->latest()->limit(10);
            },
            'bills' => function ($query) {
                $query->latest()->limit(10);
            }
        ]);

        return Inertia::render('Patients/Show', [
            'patient' => $patient,
            'appointments' => $patient->appointments,
            'medicalRecords' => $patient->medicalRecords,
            'prescriptions' => $patient->prescriptions,
            'bills' => $patient->bills,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Patient $patient)
    {
        $doctors = \App\Models\Doctor::with('user')->where('is_available', true)->get();
        $clinics = \App\Models\Clinic::where('is_active', true)->get();

        return Inertia::render('Patients/Edit', [
            'patient' => $patient->load(['user', 'primaryDoctor.user', 'preferredClinic']),
            'doctors' => $doctors,
            'clinics' => $clinics
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            // Personal Information
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:male,female,other',
            'phone' => 'required|string|max:255|unique:patients,phone,' . $patient->id,
            'emergency_contact' => 'required|string|max:255',
            'emergency_phone' => 'required|string|max:255',
            'address' => 'nullable|string',

            // Medical Information
            'blood_type' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'height_cm' => 'nullable|numeric|min:50|max:300',
            'weight_kg' => 'nullable|numeric|min:1|max:500',
            'allergies' => 'nullable|string',
            'medical_conditions' => 'nullable|string',
            'current_medications' => 'nullable|string',

            // Insurance Information
            'insurance_provider' => 'nullable|string|max:255',
            'insurance_number' => 'nullable|string|max:255',
            'policy_holder' => 'nullable|string|max:255',

            // Administrative
            'primary_doctor_id' => 'nullable|exists:doctors,id',
            'preferred_clinic_id' => 'nullable|exists:clinics,id',
            'is_active' => 'boolean',
        ]);

        $patient->update($validated);

        // Update user name if changed
        if ($patient->user) {
            $patient->user->update([
                'name' => $validated['first_name'] . ' ' . $validated['last_name']
            ]);
        }

        return redirect()->route('patients.show', $patient)->with('success', 'Patient updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient)
    {
        // Soft delete patient (mark as inactive)
        $patient->update(['is_active' => false]);

        return redirect()->route('patients.index')->with('success', 'Patient deactivated successfully');
    }

    /**
     * Get patient statistics for dashboard.
     */
    public function getStats()
    {
        $stats = [
            'total' => Patient::count(),
            'active' => Patient::where('is_active', true)->count(),
            'new_this_month' => Patient::whereMonth('created_at', now()->month)->count(),
            'by_gender' => Patient::selectRaw('gender, COUNT(*) as count')->groupBy('gender')->get(),
            'by_clinic' => Patient::with('preferredClinic')->selectRaw('preferred_clinic_id, COUNT(*) as count')->groupBy('preferred_clinic_id')->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Get patient's medical records
     */
    public function medicalRecords(Patient $patient)
    {
        $medicalRecords = $patient->medicalRecords()
            ->with(['doctor.user', 'clinic', 'appointment'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Patients/MedicalRecords', [
            'patient' => $patient->load(['user', 'primaryDoctor.user']),
            'medicalRecords' => $medicalRecords,
        ]);
    }

    /**
     * Get patient's prescriptions
     */
    public function prescriptions(Patient $patient)
    {
        $prescriptions = $patient->prescriptions()
            ->with(['doctor.user', 'medicalRecord'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Patients/Prescriptions', [
            'patient' => $patient->load(['user', 'primaryDoctor.user']),
            'prescriptions' => $prescriptions,
        ]);
    }

    /**
     * Get patient's bills
     */
    public function bills(Patient $patient)
    {
        $bills = $patient->bills()
            ->with(['appointment.doctor.user', 'appointment.patient.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Patients/Bills', [
            'patient' => $patient->load(['user', 'primaryDoctor.user']),
            'bills' => $bills,
        ]);
    }
}
