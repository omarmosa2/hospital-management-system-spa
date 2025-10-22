<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use App\Models\Role;
use App\Models\Clinic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DoctorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Check if user has permission to view doctors
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Unauthorized access to doctors management.');
        }

        $doctors = Doctor::with(['user', 'clinic', 'patients', 'schedules'])
                         ->orderBy('created_at', 'desc')
                         ->get()
                         ->map(function($doctor) {
                             return [
                                 'id' => $doctor->id,
                                 'user' => $doctor->user,
                                 'clinic' => $doctor->clinic,
                                 'license_number' => $doctor->license_number,
                                 'specialization' => $doctor->specialization,
                                 'qualification' => $doctor->qualification,
                                 'bio' => $doctor->bio,
                                 'years_of_experience' => $doctor->years_of_experience,
                                 'consultation_fee' => $doctor->consultation_fee,
                                 'procedure_fee_percentage' => $doctor->procedure_fee_percentage,
                                 'max_patients_per_day' => $doctor->max_patients_per_day,
                                 'office_phone' => $doctor->office_phone,
                                 'office_room' => $doctor->office_room,
                                 'address' => $doctor->address,
                                 'consultation_discount' => $doctor->consultation_discount,
                                 'center_percentage' => $doctor->center_percentage,
                                 'notes' => $doctor->notes,
                                 'is_available' => $doctor->is_available,
                                 'available_days' => $doctor->available_days,
                                 'start_time' => $doctor->start_time,
                                 'end_time' => $doctor->end_time,
                                 'schedules' => $doctor->schedules,
                                 'patients' => $doctor->patients,
                                 'created_at' => $doctor->created_at,
                                 'updated_at' => $doctor->updated_at,
                             ];
                         })
                         ->toArray();

        return Inertia::render('Doctors/Index', [
            'doctors' => $doctors,
            'can' => [
                'create' => Auth::user()->hasRole('admin'),
                'edit' => Auth::user()->hasRole('admin'),
                'delete' => Auth::user()->hasRole('admin'),
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
        // Check if user has permission to create doctors
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Unauthorized to create doctors.');
        }

        $clinics = Clinic::where('is_active', true)->get();

        return Inertia::render('Doctors/Create', [
            'clinics' => $clinics
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check if user has permission to create doctors
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Unauthorized to create doctors.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'specialization' => 'required|string|max:255',
            'qualification' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'consultation_fee' => 'required|numeric|min:0|max:1000',
            'procedure_fee_percentage' => 'required|numeric|min:0|max:100',
            'office_phone' => 'nullable|string|max:20',
            'office_room' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'consultation_discount' => 'required|numeric|min:0|max:100',
            'center_percentage' => 'required|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:1000',
            'is_available' => 'boolean',
            'clinic_id' => 'required|exists:clinics,id',
            'schedules' => 'required|array|min:1',
            'schedules.*.day_of_week' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'schedules.*.open_time' => 'nullable|date_format:H:i',
            'schedules.*.close_time' => 'nullable|date_format:H:i|after:schedules.*.open_time',
            'schedules.*.is_closed' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            // Create user account for the doctor
            $doctorRole = Role::where('name', 'doctor')->first();

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make('doctor123'), // Default password
            ]);

            // Assign role to user
            if ($doctorRole) {
                $user->assignRole($doctorRole);
            }

            // Create doctor profile
            $doctor = Doctor::create([
                'user_id' => $user->id,
                'clinic_id' => $validated['clinic_id'],
                'license_number' => 'DOC-' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
                'specialization' => $validated['specialization'],
                'qualification' => $validated['qualification'],
                'bio' => $validated['bio'],
                'consultation_fee' => $validated['consultation_fee'],
                'procedure_fee_percentage' => $validated['procedure_fee_percentage'],
                'office_phone' => $validated['office_phone'],
                'office_room' => $validated['office_room'],
                'address' => $validated['address'],
                'consultation_discount' => $validated['consultation_discount'],
                'center_percentage' => $validated['center_percentage'],
                'notes' => $validated['notes'],
                'is_available' => $validated['is_available'] ?? true,
            ]);

            // Create doctor schedules
            if (isset($validated['schedules']) && is_array($validated['schedules'])) {
                foreach ($validated['schedules'] as $scheduleData) {
                    $doctor->schedules()->create([
                        'doctor_id' => $doctor->id,
                        'day_of_week' => $scheduleData['day_of_week'],
                        'open_time' => $scheduleData['is_closed'] ? null : $scheduleData['open_time'],
                        'close_time' => $scheduleData['is_closed'] ? null : $scheduleData['close_time'],
                        'is_closed' => $scheduleData['is_closed'] ?? false,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('doctors.index')
                            ->with('message', 'تم إنشاء الطبيب بنجاح');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors([
                'error' => 'حدث خطأ أثناء إنشاء الطبيب: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Doctor $doctor)
    {
        // Check if user has permission to view doctors
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Unauthorized access to doctor details.');
        }

        $doctor->load(['user', 'clinic', 'patients', 'appointments']);

        return Inertia::render('Doctors/Show', [
            'doctor' => $doctor,
            'can' => [
                'edit' => Auth::user()->hasRole('admin'),
                'delete' => Auth::user()->hasRole('admin'),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Doctor $doctor)
    {
        // Check if user has permission to edit doctors
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Unauthorized to edit doctors.');
        }

        $clinics = Clinic::where('is_active', true)->get();

        return Inertia::render('Doctors/Edit', [
            'doctor' => $doctor->load(['user', 'clinic', 'schedules']),
            'clinics' => $clinics
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Doctor $doctor)
    {
        // Check if user has permission to edit doctors
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Unauthorized to edit doctors.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $doctor->user_id,
            'phone' => 'required|string|max:20',
            'specialization' => 'required|string|max:255',
            'qualification' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'consultation_fee' => 'required|numeric|min:0|max:1000',
            'procedure_fee_percentage' => 'required|numeric|min:0|max:100',
            'office_phone' => 'nullable|string|max:20',
            'office_room' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'consultation_discount' => 'required|numeric|min:0|max:100',
            'center_percentage' => 'required|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:1000',
            'is_available' => 'boolean',
            'clinic_id' => 'required|exists:clinics,id',
            'schedules' => 'required|array|min:1',
            'schedules.*.day_of_week' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'schedules.*.open_time' => 'nullable|date_format:H:i',
            'schedules.*.close_time' => 'nullable|date_format:H:i|after:schedules.*.open_time',
            'schedules.*.is_closed' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            // Update user account
            $doctor->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            // Update doctor profile
            $doctor->update([
                'clinic_id' => $validated['clinic_id'],
                'specialization' => $validated['specialization'],
                'qualification' => $validated['qualification'],
                'bio' => $validated['bio'],
                'consultation_fee' => $validated['consultation_fee'],
                'procedure_fee_percentage' => $validated['procedure_fee_percentage'],
                'office_phone' => $validated['office_phone'],
                'office_room' => $validated['office_room'],
                'address' => $validated['address'],
                'consultation_discount' => $validated['consultation_discount'],
                'center_percentage' => $validated['center_percentage'],
                'notes' => $validated['notes'],
                'is_available' => $validated['is_available'] ?? true,
            ]);

            // Update doctor schedules
            $doctor->schedules()->delete(); // Delete existing schedules

            if (isset($validated['schedules']) && is_array($validated['schedules'])) {
                foreach ($validated['schedules'] as $scheduleData) {
                    $doctor->schedules()->create([
                        'doctor_id' => $doctor->id,
                        'day_of_week' => $scheduleData['day_of_week'],
                        'open_time' => $scheduleData['is_closed'] ? null : ($scheduleData['open_time'] ?: null),
                        'close_time' => $scheduleData['is_closed'] ? null : ($scheduleData['close_time'] ?: null),
                        'is_closed' => $scheduleData['is_closed'] ?? false,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('doctors.index')
                            ->with('message', 'تم تحديث بيانات الطبيب بنجاح');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors([
                'error' => 'حدث خطأ أثناء تحديث الطبيب: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Doctor $doctor)
    {
        // Check if user has permission to delete doctors
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Unauthorized to delete doctors.');
        }

        // Check if doctor has associated appointments or patients
        if ($doctor->appointments()->count() > 0) {
            return back()->withErrors([
                'doctor' => 'لا يمكن حذف الطبيب لوجود مواعيد مرتبطة به.'
            ]);
        }

        if ($doctor->patients()->count() > 0) {
            return back()->withErrors([
                'doctor' => 'لا يمكن حذف الطبيب لوجود مرضى مرتبطين به كطبيب أساسي.'
            ]);
        }

        try {
            DB::beginTransaction();

            // Delete user account (this will cascade delete the doctor profile)
            $doctor->user->delete();

            DB::commit();

            return redirect()->route('doctors.index')
                            ->with('message', 'تم حذف الطبيب بنجاح');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors([
                'error' => 'حدث خطأ أثناء حذف الطبيب: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get doctors statistics for dashboard
     */
    public function getStats()
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403);
        }

        $stats = [
            'total_doctors' => Doctor::count(),
            'available_today' => Doctor::whereJsonContains('available_days', strtolower(now()->format('l')))->count(),
            'total_patients' => Doctor::with('patients')->get()->sum(function($doctor) {
                return $doctor->patients->count();
            }),
        ];

        return response()->json($stats);
    }
}
