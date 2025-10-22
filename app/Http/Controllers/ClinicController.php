<?php

namespace App\Http\Controllers;

use App\Models\Clinic;
use App\Http\Requests\ClinicRequest;
use App\Exports\ClinicsExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ClinicController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Check if user has permission to view clinics
        if (!Auth::user()->hasPermission('view-clinics')) {
            abort(403, 'Unauthorized access to clinics management.');
        }

        $clinics = Clinic::with(['headDoctor.user', 'doctors.user', 'schedules', 'appointments' => function($query) {
                            $query->where('status', 'confirmed');
                        }])
                        ->withCount(['doctors', 'appointments' => function($query) {
                            $query->whereIn('status', ['confirmed', 'scheduled', 'checked_in', 'in_progress'])
                                  ->where('scheduled_datetime', '>=', now()->startOfDay());
                        }])
                        ->orderBy('name')
                        ->get()
                        ->map(function($clinic) {
                            return [
                                'id' => $clinic->id,
                                'name' => $clinic->name,
                                'specialty' => $clinic->specialty,
                                'description' => $clinic->description,
                                'location' => $clinic->location,
                                'is_active' => $clinic->is_active,
                                'doctors_count' => $clinic->doctors_count,
                                'appointments_count' => $clinic->appointments_count,
                                'head_doctor' => $clinic->headDoctor ? $clinic->headDoctor->user->name : null,
                                'schedules' => $clinic->schedules->map(function($schedule) {
                                    return [
                                        'id' => $schedule->id,
                                        'day_of_week' => $schedule->day_of_week,
                                        'open_time' => $schedule->open_time->format('H:i'),
                                        'close_time' => $schedule->close_time->format('H:i'),
                                        'is_closed' => $schedule->is_closed,
                                    ];
                                }),
                                'updated_at' => $clinic->updated_at,
                            ];
                        });

        $stats = [
            'total_active_clinics' => Clinic::where('is_active', true)->count(),
            'total_inactive_clinics' => Clinic::where('is_active', false)->count(),
            'total_doctors' => Clinic::with('doctors')->get()->sum(function($clinic) {
                return $clinic->doctors->count();
            }),
        ];

        return Inertia::render('Clinics/Index', [
            'clinics' => $clinics,
            'stats' => $stats,
            'can' => [
                'create' => Auth::user()->hasPermission('create-clinics'),
                'edit' => Auth::user()->hasPermission('edit-clinics'),
                'delete' => Auth::user()->hasPermission('delete-clinics'),
                'export' => Auth::user()->hasPermission('export-reports'),
            ],
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Check if user has permission to create clinics
        if (!Auth::user()->hasPermission('create-clinics')) {
            abort(403, 'Unauthorized to create clinics.');
        }

        return Inertia::render('Clinics/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ClinicRequest $request)
    {
        // Check if user has permission to create clinics
        if (!Auth::user()->hasPermission('create-clinics')) {
            abort(403, 'Unauthorized to create clinics.');
        }

        $validated = $request->validated();

        // Remove fields that don't exist in the database
        unset($validated['color'], $validated['head_doctor_id']);

        // Set default values for required fields
        $validated['start_time'] = $validated['start_time'] ?? '08:00';
        $validated['end_time'] = $validated['end_time'] ?? '18:00';
        $validated['max_patients_per_day'] = $validated['max_patients_per_day'] ?? 50;
        $validated['consultation_duration_minutes'] = $validated['consultation_duration_minutes'] ?? 30;

        // Handle working_days transformation - ensure it's properly formatted for JSON storage
        if (isset($validated['working_days'])) {
            if (is_array($validated['working_days'])) {
                // Already an array, keep as is
                $validated['working_days'] = $validated['working_days'];
            } elseif (is_string($validated['working_days'])) {
                // String, decode it
                $decoded = json_decode($validated['working_days'], true);
                $validated['working_days'] = is_array($decoded) ? $decoded : [];
            } else {
                // Fallback to empty array
                $validated['working_days'] = [];
            }
        } else {
            // If not provided, set to empty array
            $validated['working_days'] = [];
        }

        $clinic = Clinic::create($validated);

        // Handle schedules creation
        if (isset($validated['schedules']) && is_array($validated['schedules'])) {
            foreach ($validated['schedules'] as $scheduleData) {
                $clinic->schedules()->create([
                    'day_of_week' => $scheduleData['day_of_week'],
                    'open_time' => $scheduleData['open_time'],
                    'close_time' => $scheduleData['close_time'],
                    'is_closed' => $scheduleData['is_closed'] ?? false,
                ]);
            }
        }

        // Activity logging is handled automatically by the model trait

        return redirect()->route('clinics.index')
                        ->with('message', 'تم إنشاء العيادة بنجاح');
    }

    /**
     * Display the specified resource.
     */
    public function show(Clinic $clinic)
    {
        // Check if user has permission to view clinics
        if (!Auth::user()->hasPermission('view-clinics')) {
            abort(403, 'Unauthorized access to clinic details.');
        }

        $clinic->load(['headDoctor.user', 'doctors.user', 'schedules']);

        return Inertia::render('Clinics/Show', [
            'clinic' => $clinic,
            'can' => [
                'edit' => Auth::user()->hasPermission('edit-clinics'),
                'delete' => Auth::user()->hasPermission('delete-clinics'),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Clinic $clinic)
    {
        // Check if user has permission to edit clinics
        if (!Auth::user()->canPerform('edit-clinics')) {
            abort(403, 'Unauthorized to edit clinics.');
        }

        return Inertia::render('Clinics/Edit', [
            'clinic' => $clinic
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ClinicRequest $request, Clinic $clinic)
    {
        // Check if user has permission to edit clinics
        if (!Auth::user()->canPerform('edit-clinics')) {
            abort(403, 'Unauthorized to edit clinics.');
        }

        $validated = $request->validated();

        // Remove fields that don't exist in the database
        unset($validated['color'], $validated['head_doctor_id']);

        // Set default values for required fields
        $validated['start_time'] = $validated['start_time'] ?? '08:00';
        $validated['end_time'] = $validated['end_time'] ?? '18:00';
        $validated['max_patients_per_day'] = $validated['max_patients_per_day'] ?? 50;
        $validated['consultation_duration_minutes'] = $validated['consultation_duration_minutes'] ?? 30;

        // Handle working_days transformation - ensure it's properly formatted for JSON storage
        if (isset($validated['working_days'])) {
            if (is_array($validated['working_days'])) {
                // Already an array, keep as is
                $validated['working_days'] = $validated['working_days'];
            } elseif (is_string($validated['working_days'])) {
                // String, decode it
                $decoded = json_decode($validated['working_days'], true);
                $validated['working_days'] = is_array($decoded) ? $decoded : [];
            } else {
                // Fallback to empty array
                $validated['working_days'] = [];
            }
        } else {
            // If not provided, set to empty array
            $validated['working_days'] = [];
        }

        $clinic->update($validated);

        // Handle schedules update
        if (isset($validated['schedules']) && is_array($validated['schedules'])) {
            // Delete existing schedules
            $clinic->schedules()->delete();

            // Create new schedules
            foreach ($validated['schedules'] as $scheduleData) {
                $clinic->schedules()->create([
                    'day_of_week' => $scheduleData['day_of_week'],
                    'open_time' => $scheduleData['open_time'],
                    'close_time' => $scheduleData['close_time'],
                    'is_closed' => $scheduleData['is_closed'] ?? false,
                ]);
            }
        }

        return redirect()->route('clinics.index')
                        ->with('message', 'تم تحديث بيانات العيادة بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Clinic $clinic)
    {
        // Check if user has permission to delete clinics
        if (!Auth::user()->canPerform('delete-clinics')) {
            abort(403, 'Unauthorized to delete clinics.');
        }

        // Check if clinic has associated doctors or appointments
        if ($clinic->doctors()->count() > 0) {
            return back()->withErrors([
                'clinic' => 'لا يمكن حذف العيادة لوجود أطباء مرتبطين بها.'
            ]);
        }

        if ($clinic->appointments()->count() > 0) {
            return back()->withErrors([
                'clinic' => 'لا يمكن حذف العيادة لوجود مواعيد مرتبطة بها.'
            ]);
        }

        $clinic->delete();

        return redirect()->route('clinics.index')
                        ->with('message', 'تم حذف العيادة بنجاح');
    }

    /**
     * Get clinics statistics for dashboard
     */
    public function getStats()
    {
        if (!Auth::user()->canPerform('view-clinics')) {
            abort(403);
        }

        $stats = [
            'total_clinics' => Clinic::count(),
            'active_clinics' => Clinic::where('is_active', true)->count(),
            'inactive_clinics' => Clinic::where('is_active', false)->count(),
            'total_doctors' => Clinic::with('doctors')->get()->sum(function($clinic) {
                return $clinic->doctors->count();
            }),
            'total_appointments' => Clinic::with('appointments')->get()->sum(function($clinic) {
                return $clinic->appointments->count();
            }),
            'active_appointments' => Clinic::with(['appointments' => function($query) {
                $query->where('status', 'confirmed')
                      ->where('appointment_date', '>=', now()->toDateString());
            }])->get()->sum(function($clinic) {
                return $clinic->appointments->count();
            }),
        ];

        return response()->json($stats);
    }

    /**
     * Search and filter clinics
     */
    public function search(Request $request)
    {
        if (!Auth::user()->hasPermission('view-clinics')) {
            abort(403);
        }

        $query = Clinic::query();

        // Search by name
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter by specialty
        if ($request->filled('specialty')) {
            $query->where('specialty', $request->specialty);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $clinics = $query->with(['headDoctor.user', 'doctors.user', 'schedules', 'appointments' => function($query) {
                            $query->where('status', 'confirmed');
                        }])
                        ->withCount(['doctors', 'appointments' => function($query) {
                            $query->where('status', 'confirmed')
                                  ->where('appointment_date', '>=', now()->toDateString());
                        }])
                        ->orderBy('name')
                        ->get()
                        ->map(function($clinic) {
                             return [
                                 'id' => $clinic->id,
                                 'name' => $clinic->name,
                                 'specialty' => $clinic->specialty,
                                 'description' => $clinic->description,
                                 'location' => $clinic->location,
                                 'phone' => $clinic->phone,
                                 'email' => $clinic->email,
                                 'schedules' => $clinic->schedules->map(function($schedule) {
                                     return [
                                         'day_of_week' => $schedule->day_of_week,
                                         'open_time' => $schedule->open_time->format('H:i'),
                                         'close_time' => $schedule->close_time->format('H:i'),
                                         'is_closed' => $schedule->is_closed,
                                     ];
                                 }),
                                 'max_patients_per_day' => $clinic->max_patients_per_day,
                                 'consultation_duration_minutes' => $clinic->consultation_duration_minutes,
                                 'is_active' => $clinic->is_active,
                                 'doctors_count' => $clinic->doctors_count,
                                 'appointments_count' => $clinic->appointments_count,
                                 'head_doctor' => $clinic->headDoctor ? $clinic->headDoctor->user->name : null,
                                 'created_at' => $clinic->created_at,
                                 'updated_at' => $clinic->updated_at,
                             ];
                         });

        return response()->json($clinics);
    }

    /**
     * Export clinics to Excel/CSV
     */
    public function export(Request $request)
    {
        if (!Auth::user()->hasPermission('export-reports')) {
            abort(403);
        }

        $format = $request->get('format', 'excel');

        if ($format === 'excel') {
            return Excel::download(new ClinicsExport, 'clinics_' . now()->format('Y-m-d') . '.xlsx');
        }

        // CSV export fallback
        $clinics = Clinic::with(['headDoctor.user', 'doctors.user'])
                        ->withCount(['doctors', 'appointments' => function($query) {
                            $query->where('status', 'confirmed');
                        }])
                        ->orderBy('name')
                        ->get();

        $filename = 'clinics_' . now()->format('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($clinics) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['اسم العيادة', 'التخصص', 'الوصف', 'الموقع', 'الحالة', 'عدد الأطباء', 'عدد المواعيد', 'رئيس الأطباء']);

            foreach ($clinics as $clinic) {
                fputcsv($file, [
                    $clinic->name,
                    $clinic->specialty ?? 'غير محدد',
                    $clinic->description ?? '',
                    $clinic->location ?? '',
                    $clinic->is_active ? 'فعالة' : 'غير فعالة',
                    $clinic->doctors_count,
                    $clinic->appointments_count,
                    $clinic->headDoctor ? $clinic->headDoctor->user->name : '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
