<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Check user role for access control - Admin and Reception staff only
        $user = Auth::user();
        $userRoles = $user->roles->pluck('name')->toArray();
        if (!array_intersect($userRoles, ['admin', 'receptionist'])) {
            abort(403, 'Unauthorized access');
        }

        // Encrypt sensitive data for authorized users only
        $query = Patient::with(['user', 'createdBy'])
            ->when($request->search, function ($q) use ($request) {
                $q->where('full_name', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%')
                  ->orWhere('identity_number', 'like', '%' . $request->search . '%')
                  ->orWhere('patient_id', 'like', '%' . $request->search . '%');
            })
            ->when($request->status && $request->status !== 'all', function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active');
            })
            ->orderBy('created_at', 'desc');

        $patients = $query->paginate(15)->through(function ($patient) use ($userRoles) {
            // Hide sensitive patient data for non-admin users
            if (!in_array('admin', $userRoles)) {
                $patient->makeHidden(['identity_number', 'notes', 'medical_conditions', 'allergies', 'current_medications']);
            }
            return $patient;
        });

        // Determine permissions based on user roles
        $hasAdminAccess = in_array('admin', $userRoles);
        $hasReceptionAccess = in_array('receptionist', $userRoles);
        $canManage = $hasAdminAccess || $hasReceptionAccess;

        return Inertia::render('Patients/Index', [
            'patients' => $patients,
            'filters' => $request->only(['search', 'status']),
            'canCreate' => $canManage,
            'canEdit' => $canManage,
            'canDelete' => $canManage,
            'userRole' => $userRoles,
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
         // Check user role for access control - Admin and Reception staff only
         $user = Auth::user();
         $userRoles = $user->roles->pluck('name')->toArray();
         if (!array_intersect($userRoles, ['admin', 'receptionist'])) {
             abort(403, 'Unauthorized access');
         }


        // Sanitize inputs before validation
        $sanitizedData = $request->all();

        // Trim whitespace from all inputs
        array_walk_recursive($sanitizedData, function (&$value) {
            if (is_string($value)) {
                $value = trim($value);
            }
        });

        $request->merge($sanitizedData);

        $validated = $request->validate([
            // Personal Information - الاسم الثلاثي
            'full_name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[\p{Arabic}\p{L}\s]+$/u', // Arabic/English letters and spaces
                function ($attribute, $value, $fail) {
                    $parts = preg_split('/\s+/', trim($value));
                    if (count($parts) < 3) {
                        $fail('يجب إدخال اسم ثلاثي كامل (أسماء، أب، جد على الأقل)');
                    }
                },
            ],
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:ذكر,أنثى',
            'address' => 'nullable|string|max:255', // مكان الإقامة

            // Contact Information - رقم التواصل
            'phone' => [
                'required',
                'string',
                'max:255',
                'regex:/^(\+966\d{9}|05\d{8})$/',
                function ($attribute, $value, $fail) {
                    if (Patient::phoneNumberExists($value)) {
                        $fail('رقم التواصل موجود بالفعل في النظام');
                    }
                },
            ],
            'email' => 'nullable|email|max:255',

            // Administrative - رقم الإضبارة
            'identity_number' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    if ($value && Patient::identityNumberExists($value)) {
                        $fail('رقم الإضبارة موجود بالفعل في النظام');
                    }
                },
            ],
            'notes' => 'nullable|string|max:1000', // ملاحظات إضافية
            'is_active' => 'boolean',
        ], [
            // Custom Arabic error messages
            'full_name.required' => 'الاسم الثلاثي مطلوب',
            'full_name.regex' => 'الاسم يجب أن يحتوي على حروف عربية أو إنجليزية فقط',
            'date_of_birth.required' => 'تاريخ الميلاد مطلوب',
            'date_of_birth.before' => 'تاريخ الميلاد يجب أن يكون قبل اليوم',
            'gender.required' => 'الجنس مطلوب',
            'phone.required' => 'رقم التواصل مطلوب',
            'phone.regex' => 'صيغة رقم التواصل غير صحيحة (مثال: +966xxxxxxxxx أو 05xxxxxxxx)',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة',
        ]);

        try {
            $patient = null; // Initialize variable

            DB::transaction(function () use ($validated, &$patient) {
                // Generate unique patient ID
                $patientId = Patient::generatePatientId();

                // Calculate age from date of birth
                $dateOfBirth = \Carbon\Carbon::parse($validated['date_of_birth']);
                $age = $dateOfBirth->age;

                // Create patient record (without user association for reception workflow)
                $patient = Patient::create(array_merge($validated, [
                    'patient_id' => $patientId,
                    'age' => $age,
                    'created_by' => Auth::check() ? Auth::id() : null,
                    'created_at_staff' => now(),
                ]));

                // Log activity for audit trail
                \Spatie\Activitylog\Models\Activity::create([
                    'log_name' => 'patient_creation',
                    'description' => 'تم إنشاء مريض جديد',
                    'subject_type' => Patient::class,
                    'subject_id' => $patient->id,
                    'causer_type' => User::class,
                    'causer_id' => Auth::id(),
                    'properties' => [
                        'patient_id' => $patient->patient_id,
                        'full_name' => $patient->full_name,
                        'phone' => $patient->phone,
                    ],
                ]);
            });

            // Return success redirect for Inertia
            return redirect()->route('patients.show', $patient)->with('success', 'تم إضافة المريض بنجاح');

        } catch (\Illuminate\Database\QueryException $e) {
            // Handle database-specific errors
            if ($e->getCode() == 23000) { // Integrity constraint violation
                return back()->withErrors([
                    'error' => 'البيانات المدخلة تحتوي على تكرار. يرجى التحقق من رقم الهاتف أو رقم الإضبارة'
                ])->withInput();
            }
            return back()->withErrors([
                'error' => 'خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى'
            ])->withInput();

        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Patient creation failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'data' => $validated
            ]);

            return back()->withErrors([
                'error' => 'فشل في إضافة المريض. يرجى المحاولة مرة أخرى لاحقاً'
            ])->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Patient $patient)
    {
        $patient->load([
            'user',
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
        // Check user role for access control - Admin and Reception staff only
        $user = Auth::user();
        $userRoles = $user->roles->pluck('name')->toArray();
        if (!array_intersect($userRoles, ['admin', 'receptionist'])) {
            abort(403, 'Unauthorized access');
        }

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
        // Check user role for access control - Admin and Reception staff only
        $user = Auth::user();
        $userRoles = $user->roles->pluck('name')->toArray();
        if (!array_intersect($userRoles, ['admin', 'receptionist'])) {
            abort(403, 'Unauthorized access');
        }

        $validated = $request->validate([
            // Personal Information - الاسم الثلاثي
            'full_name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[\p{Arabic}\p{L}\s]+$/u', // Arabic/English letters and spaces
                function ($attribute, $value, $fail) {
                    $parts = preg_split('/\s+/', trim($value));
                    if (count($parts) < 3) {
                        $fail('يجب إدخال اسم ثلاثي كامل (أسماء، أب، جد على الأقل)');
                    }
                },
            ],
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:ذكر,أنثى',
            'address' => 'nullable|string|max:255', // مكان الإقامة

            // Contact Information - رقم التواصل
            'phone' => [
                'required',
                'string',
                'max:255',
                'regex:/^(\+966\d{9}|05\d{8})$/',
                function ($attribute, $value, $fail) use ($patient) {
                    if (Patient::phoneNumberExists($value, $patient->id)) {
                        $fail('رقم التواصل موجود بالفعل في النظام');
                    }
                },
            ],
            'email' => 'nullable|email|max:255',

            // Administrative - رقم الإضبارة
            'identity_number' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($patient) {
                    if ($value && Patient::identityNumberExists($value, $patient->id)) {
                        $fail('رقم الإضبارة موجود بالفعل في النظام');
                    }
                },
            ],

            // Medical Information
            'blood_type' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'allergies' => 'nullable|string',
            'medical_conditions' => 'nullable|string',
            'current_medications' => 'nullable|string',
            'last_visit_date' => 'nullable|date',

            'notes' => 'nullable|string|max:1000', // ملاحظات إضافية
            'is_active' => 'boolean',
        ], [
            // Custom Arabic error messages
            'full_name.required' => 'الاسم الثلاثي مطلوب',
            'full_name.regex' => 'الاسم يجب أن يحتوي على حروف عربية أو إنجليزية فقط',
            'date_of_birth.required' => 'تاريخ الميلاد مطلوب',
            'date_of_birth.before' => 'تاريخ الميلاد يجب أن يكون قبل اليوم',
            'gender.required' => 'الجنس مطلوب',
            'phone.required' => 'رقم التواصل مطلوب',
            'phone.regex' => 'صيغة رقم التواصل غير صحيحة (مثال: +966xxxxxxxxx أو 05xxxxxxxx)',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة',
        ]);

        try {
            // Calculate age from date of birth
            $dateOfBirth = \Carbon\Carbon::parse($validated['date_of_birth']);
            $validated['age'] = $dateOfBirth->age;

            // Store old values for logging
            $oldValues = $patient->only(['full_name', 'phone', 'email', 'identity_number', 'is_active']);

            $patient->update($validated);

            // Update user name if changed
            if ($patient->user && $validated['full_name'] !== $oldValues['full_name']) {
                $patient->user->update([
                    'name' => $validated['full_name']
                ]);
            }

            // Log update activity
            \Spatie\Activitylog\Models\Activity::create([
                'log_name' => 'patient_update',
                'description' => 'تم تحديث بيانات المريض',
                'subject_type' => Patient::class,
                'subject_id' => $patient->id,
                'causer_type' => User::class,
                'causer_id' => Auth::id(),
                'properties' => [
                    'old' => $oldValues,
                    'new' => $patient->only(['full_name', 'phone', 'email', 'identity_number', 'is_active']),
                    'patient_id' => $patient->patient_id,
                ],
            ]);

            return redirect()->route('patients.show', $patient)->with('success', 'تم تحديث بيانات المريض بنجاح');
        } catch (\Exception $e) {
            Log::error('Patient update failed', [
                'error' => $e->getMessage(),
                'patient_id' => $patient->id,
                'user_id' => Auth::id(),
                'data' => $validated
            ]);

            return back()->withErrors(['error' => 'فشل في تحديث بيانات المريض. يرجى المحاولة مرة أخرى']);
        }
    }

    /**
     /**
      * Remove the specified resource from storage.
      */
     public function destroy(Patient $patient)
     {
         // Check user role for access control - Only Admin can delete
         $user = Auth::user();
         $userRoles = $user->roles->pluck('name')->toArray();
         if (!in_array('admin', $userRoles)) {
             abort(403, 'Unauthorized access');
         }

         // Soft delete patient (mark as inactive)
         $patient->update(['is_active' => false]);

         // Log deletion activity
         \Spatie\Activitylog\Models\Activity::create([
             'log_name' => 'patient_deletion',
             'description' => 'تم حذف مريض',
             'subject_type' => Patient::class,
             'subject_id' => $patient->id,
             'causer_type' => User::class,
             'causer_id' => Auth::id(),
             'properties' => [
                 'patient_id' => $patient->patient_id,
                 'full_name' => $patient->full_name,
             ],
         ]);

         return redirect()->route('patients.index')->with('success', 'تم حذف المريض بنجاح');
     }

    /**
     * Get patient statistics for dashboard with caching.
     */
    public function getStats()
    {
        $cacheKey = 'patient_stats_' . date('Y-m-d');

        $stats = Cache::remember($cacheKey, 3600, function () { // Cache for 1 hour
            return [
                'total' => Patient::count(),
                'active' => Patient::where('is_active', true)->count(),
                'inactive' => Patient::where('is_active', false)->count(),
                'new_this_month' => Patient::whereMonth('created_at', now()->month)->count(),
                'new_this_week' => Patient::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'by_gender' => Patient::selectRaw('gender, COUNT(*) as count')
                    ->where('is_active', true)
                    ->groupBy('gender')
                    ->get()
                    ->mapWithKeys(function ($item) {
                        return [$item->gender => $item->count];
                    }),
                'by_age_group' => $this->getAgeGroupStats(),
                'average_age' => round(Patient::where('is_active', true)->avg('age') ?? 0, 1),
                'last_updated' => now()->toISOString(),
            ];
        });

        return response()->json($stats);
    }

    /**
     * Get age group statistics for reports.
     */
    private function getAgeGroupStats()
    {
        return [
            '0-17' => Patient::where('is_active', true)->where('age', '<=', 17)->count(),
            '18-35' => Patient::where('is_active', true)->whereBetween('age', [18, 35])->count(),
            '36-50' => Patient::where('is_active', true)->whereBetween('age', [36, 50])->count(),
            '51-65' => Patient::where('is_active', true)->whereBetween('age', [51, 65])->count(),
            '66+' => Patient::where('is_active', true)->where('age', '>=', 66)->count(),
        ];
    }

    /**
     * Export patients data for reports.
     */
    public function export(Request $request)
    {
        $user = Auth::user();
        $userRoles = $user->roles->pluck('name')->toArray();

        if (!in_array('admin', $userRoles)) {
            abort(403, 'Unauthorized access');
        }

        $query = Patient::with(['user', 'createdBy'])
            ->when($request->status && $request->status !== 'all', function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active');
            })
            ->orderBy('created_at', 'desc');

        $patients = $query->get();

        // Log export activity
        \Spatie\Activitylog\Models\Activity::create([
            'log_name' => 'patient_export',
            'description' => 'تصدير بيانات المرضى',
            'subject_type' => Patient::class,
            'causer_type' => User::class,
            'causer_id' => Auth::id(),
            'properties' => [
                'record_count' => $patients->count(),
                'filters' => $request->all(),
            ],
        ]);

        // Create CSV content
        $csvContent = $this->generatePatientCSV($patients);

        return response($csvContent)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="patients_' . date('Y-m-d_H-i-s') . '.csv"')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    /**
     * Generate CSV content for patient export.
     */
    private function generatePatientCSV($patients)
    {
        $headers = [
            'رقم المريض',
            'الاسم الثلاثي',
            'تاريخ الميلاد',
            'العمر',
            'الجنس',
            'رقم التواصل',
            'البريد الإلكتروني',
            'رقم الإضبارة',
            'مكان الإقامة',
            'الحالة',
            'تاريخ الإنشاء'
        ];

        $csv = implode(',', $headers) . "\n";

        foreach ($patients as $patient) {
            $row = [
                $patient->patient_id,
                $patient->full_name,
                $patient->date_of_birth ? $patient->date_of_birth->format('Y-m-d') : '',
                $patient->age ?? '',
                $patient->gender,
                $patient->phone,
                $patient->email ?? '',
                $patient->identity_number ?? '',
                $patient->address ?? '',
                $patient->is_active ? 'نشط' : 'غير نشط',
                $patient->created_at->format('Y-m-d H:i:s')
            ];

            // Escape commas and quotes in CSV
            $escapedRow = array_map(function ($field) {
                if (strpos($field, ',') !== false || strpos($field, '"') !== false) {
                    return '"' . str_replace('"', '""', $field) . '"';
                }
                return $field;
            }, $row);

            $csv .= implode(',', $escapedRow) . "\n";
        }

        return $csv;
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
