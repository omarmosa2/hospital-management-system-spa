<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DoctorPatientsController extends Controller
{
    /**
     * Display a listing of patients assigned to the authenticated doctor.
     */
    public function index(Request $request)
    {
        // Get the authenticated doctor
        $user = Auth::user();
        $userRoles = $user->roles->pluck('name')->toArray();

        // Check if user is a doctor
        if (!in_array('doctor', $userRoles)) {
            abort(403, 'Unauthorized access - Doctors only');
        }

        // Get doctor's user ID to find associated patients
        $doctorId = $user->id;

        $query = Patient::assignedToDoctor($doctorId)
            ->with([
                'user',
                'appointments' => function($q) use ($doctorId) {
                    $q->where('doctor_id', $doctorId)
                      ->with(['clinic', 'medicalRecords'])
                      ->latest()
                      ->take(5); // Recent appointments
                },
                'medicalRecords' => function($q) use ($doctorId) {
                    $q->whereHas('appointment', function($appointmentQuery) use ($doctorId) {
                        $appointmentQuery->where('doctor_id', $doctorId);
                    })
                    ->latest()
                    ->take(3);
                }
            ])
            ->active(); // Only show active patients

        // Apply search filters
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('full_name', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%')
                  ->orWhere('patient_id', 'like', '%' . $request->search . '%')
                  ->orWhere('identity_number', 'like', '%' . $request->search . '%');
            });
        }

        // Apply additional filters
        if ($request->status && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }

        if ($request->gender && $request->gender !== 'all') {
            $query->where('gender', $request->gender);
        }

        if ($request->has_recent_visit) {
            $query->whereHas('appointments', function($q) use ($doctorId) {
                $q->where('doctor_id', $doctorId)
                  ->where('scheduled_datetime', '>=', now()->subMonths(3));
            });
        }

        if ($request->has_medical_records) {
            $query->whereHas('medicalRecords', function($q) use ($doctorId) {
                $q->whereHas('appointment', function($appointmentQuery) use ($doctorId) {
                    $appointmentQuery->where('doctor_id', $doctorId);
                });
            });
        }

        $patients = $query->orderBy('last_visit_date', 'desc')
                          ->paginate(15)
                          ->through(function ($patient) use ($doctorId) {
                              $doctorAppointments = $patient->appointments->where('doctor_id', $doctorId);
                              $latestAppointment = $doctorAppointments->first();

                              return [
                                  'id' => $patient->id,
                                  'patient_id' => $patient->patient_id,
                                  'full_name' => $patient->full_name,
                                  'phone' => $patient->phone,
                                  'email' => $patient->email,
                                  'gender' => $patient->gender,
                                  'age' => $patient->age,
                                  'address' => $patient->address,
                                  'blood_type' => $patient->blood_type,
                                  'allergies' => $patient->allergies,
                                  'current_medications' => $patient->current_medications,
                                  'medical_conditions' => $patient->medical_conditions,
                                  'last_visit_date' => $patient->last_visit_date,
                                  'notes' => $patient->notes,
                                  'is_active' => $patient->is_active,
                                  'latest_appointment' => $latestAppointment,
                                  'total_appointments_with_doctor' => $doctorAppointments->count(),
                                  'has_medical_records' => $patient->medicalRecords->count() > 0,
                                  'recent_medical_records' => $patient->medicalRecords->take(3),
                                  'created_at' => $patient->created_at,
                              ];
                          });

        return Inertia::render('DoctorPatients/Index', [
            'patients' => $patients,
            'filters' => $request->only([
                'search', 'status', 'gender', 'has_recent_visit', 'has_medical_records'
            ]),
            'stats' => [
                'total_patients' => Patient::assignedToDoctor($doctorId)->active()->count(),
                'active_this_month' => Patient::assignedToDoctor($doctorId)
                    ->whereHas('appointments', function($q) use ($doctorId) {
                        $q->where('doctor_id', $doctorId)
                          ->whereMonth('scheduled_datetime', now()->month);
                    })->count(),
                'with_medical_records' => Patient::assignedToDoctor($doctorId)
                    ->whereHas('medicalRecords', function($q) use ($doctorId) {
                        $q->whereHas('appointment', function($appointmentQuery) use ($doctorId) {
                            $appointmentQuery->where('doctor_id', $doctorId);
                        });
                    })->count(),
            ],
            'canView' => true, // Doctors can only view, not create/edit/delete
            'canViewDetails' => true,
        ]);
    }

    /**
     * Display the specified patient details for the doctor.
     */
    public function show(Patient $patient)
    {
        // Check if user is a doctor
        $user = Auth::user();
        $userRoles = $user->roles->pluck('name')->toArray();

        if (!in_array('doctor', $userRoles)) {
            abort(403, 'Unauthorized access - Doctors only');
        }

        // Check if patient is assigned to this doctor
        $doctorId = $user->id;
        $isAssigned = $patient->appointments()->where('doctor_id', $doctorId)->exists();

        if (!$isAssigned) {
            abort(403, 'You can only view patients assigned to you');
        }

        $patient->load([
            'user',
            'appointments' => function ($query) use ($doctorId) {
                $query->where('doctor_id', $doctorId)
                      ->with(['clinic', 'medicalRecords.doctor.user'])
                      ->latest()
                      ->take(10);
            },
            'medicalRecords' => function ($query) use ($doctorId) {
                $query->whereHas('appointment', function($appointmentQuery) use ($doctorId) {
                    $appointmentQuery->where('doctor_id', $doctorId);
                })
                ->with(['appointment', 'doctor.user'])
                ->latest()
                ->take(10);
            },
            'prescriptions' => function ($query) use ($doctorId) {
                $query->whereHas('appointment', function($appointmentQuery) use ($doctorId) {
                    $appointmentQuery->where('doctor_id', $doctorId);
                })
                ->with(['medicalRecord'])
                ->latest()
                ->take(10);
            },
        ]);

        return Inertia::render('DoctorPatients/Show', [
            'patient' => [
                'id' => $patient->id,
                'patient_id' => $patient->patient_id,
                'full_name' => $patient->full_name,
                'phone' => $patient->phone,
                'email' => $patient->email,
                'gender' => $patient->gender,
                'age' => $patient->age,
                'address' => $patient->address,
                'blood_type' => $patient->blood_type,
                'allergies' => $patient->allergies,
                'current_medications' => $patient->current_medications,
                'medical_conditions' => $patient->medical_conditions,
                'last_visit_date' => $patient->last_visit_date,
                'notes' => $patient->notes,
                'is_active' => $patient->is_active,
                'date_of_birth' => $patient->date_of_birth,
                'identity_number' => $patient->identity_number,
                'created_at' => $patient->created_at,
                'user' => $patient->user,
                // Medical history summary specific to this doctor
                'medical_history_summary' => [
                    'total_appointments' => $patient->appointments->count(),
                    'total_medical_records' => $patient->medicalRecords->count(),
                    'total_prescriptions' => $patient->prescriptions->count(),
                    'last_visit' => $patient->last_visit_date,
                    'blood_type' => $patient->blood_type,
                    'allergies' => $patient->allergies,
                    'current_medications' => $patient->current_medications,
                    'medical_conditions' => $patient->medical_conditions,
                ],
            ],
            'appointments' => $patient->appointments,
            'medicalRecords' => $patient->medicalRecords,
            'prescriptions' => $patient->prescriptions,
            'canView' => true,
            'canEdit' => false, // Doctors cannot edit patient basic info
            'canCreateAppointment' => true, // Doctors can create appointments
        ]);
    }

    /**
     * Get patient statistics for the doctor's dashboard.
     */
    public function getStats()
    {
        $user = Auth::user();
        if (!in_array('doctor', $user->roles->pluck('name')->toArray())) {
            abort(403, 'Unauthorized access');
        }

        $doctorId = $user->id;

        $stats = [
            'total_patients' => Patient::assignedToDoctor($doctorId)->active()->count(),
            'new_this_month' => Patient::assignedToDoctor($doctorId)
                ->whereHas('appointments', function($q) use ($doctorId) {
                    $q->where('doctor_id', $doctorId)
                      ->whereMonth('created_at', now()->month);
                })->count(),
            'active_patients' => Patient::assignedToDoctor($doctorId)
                ->whereHas('appointments', function($q) use ($doctorId) {
                    $q->where('doctor_id', $doctorId)
                      ->where('scheduled_datetime', '>=', now()->subMonths(3));
                })->count(),
            'patients_with_records' => Patient::assignedToDoctor($doctorId)
                ->whereHas('medicalRecords', function($q) use ($doctorId) {
                    $q->whereHas('appointment', function($appointmentQuery) use ($doctorId) {
                        $appointmentQuery->where('doctor_id', $doctorId);
                    });
                })->count(),
            'by_gender' => Patient::assignedToDoctor($doctorId)
                ->selectRaw('gender, COUNT(*) as count')
                ->groupBy('gender')
                ->get(),
        ];

        return response()->json($stats);
    }
}