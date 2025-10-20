<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use App\Models\Role;
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
        if (!Auth::user()->hasPermission('view-doctors')) {
            abort(403, 'Unauthorized access to doctors management.');
        }

        $doctors = Doctor::with(['user', 'clinic'])
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->toArray();

        return Inertia::render('Doctors/Index', [
            'doctors' => $doctors,
            'can' => [
                'create' => Auth::user()->hasPermission('create-doctors'),
                'edit' => Auth::user()->hasPermission('edit-doctors'),
                'delete' => Auth::user()->hasPermission('delete-doctors'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Check if user has permission to create doctors
        if (!Auth::user()->hasPermission('create-doctors')) {
            abort(403, 'Unauthorized to create doctors.');
        }

        return Inertia::render('Doctors/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check if user has permission to create doctors
        if (!Auth::user()->hasPermission('create-doctors')) {
            abort(403, 'Unauthorized to create doctors.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'license_number' => 'required|string|unique:doctors,license_number',
            'specialization' => 'required|string|max:255',
            'qualification' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'years_of_experience' => 'required|integer|min:0|max:50',
            'consultation_fee' => 'required|numeric|min:0|max:1000',
            'max_patients_per_day' => 'required|integer|min:1|max:100',
            'office_phone' => 'nullable|string|max:20',
            'office_room' => 'nullable|string|max:50',
            'available_days' => 'required|array|min:1',
            'available_days.*' => 'string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'clinic_id' => 'required|exists:clinics,id',
        ]);

        try {
            DB::beginTransaction();

            // Create user account for the doctor
            $doctorRole = Role::where('name', 'doctor')->first();

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make('doctor123'), // Default password
                'role_id' => $doctorRole ? $doctorRole->id : null,
            ]);

            // Create doctor profile
            $doctor = Doctor::create([
                'user_id' => $user->id,
                'clinic_id' => $validated['clinic_id'],
                'license_number' => $validated['license_number'],
                'specialization' => $validated['specialization'],
                'qualification' => $validated['qualification'],
                'bio' => $validated['bio'],
                'years_of_experience' => $validated['years_of_experience'],
                'consultation_fee' => $validated['consultation_fee'],
                'max_patients_per_day' => $validated['max_patients_per_day'],
                'office_phone' => $validated['office_phone'],
                'office_room' => $validated['office_room'],
                'available_days' => $validated['available_days'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
            ]);

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
        if (!Auth::user()->hasPermission('view-doctors')) {
            abort(403, 'Unauthorized access to doctor details.');
        }

        $doctor->load(['user', 'clinic', 'patients', 'appointments']);

        return Inertia::render('Doctors/Show', [
            'doctor' => $doctor,
            'can' => [
                'edit' => Auth::user()->hasPermission('edit-doctors'),
                'delete' => Auth::user()->hasPermission('delete-doctors'),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Doctor $doctor)
    {
        // Check if user has permission to edit doctors
        if (!Auth::user()->hasPermission('edit-doctors')) {
            abort(403, 'Unauthorized to edit doctors.');
        }

        return Inertia::render('Doctors/Edit', [
            'doctor' => $doctor->load(['user', 'clinic'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Doctor $doctor)
    {
        // Check if user has permission to edit doctors
        if (!Auth::user()->hasPermission('edit-doctors')) {
            abort(403, 'Unauthorized to edit doctors.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $doctor->user_id,
            'phone' => 'required|string|max:20',
            'license_number' => 'required|string|unique:doctors,license_number,' . $doctor->id,
            'specialization' => 'required|string|max:255',
            'qualification' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'years_of_experience' => 'required|integer|min:0|max:50',
            'consultation_fee' => 'required|numeric|min:0|max:1000',
            'max_patients_per_day' => 'required|integer|min:1|max:100',
            'office_phone' => 'nullable|string|max:20',
            'office_room' => 'nullable|string|max:50',
            'available_days' => 'required|array|min:1',
            'available_days.*' => 'string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'clinic_id' => 'required|exists:clinics,id',
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
                'license_number' => $validated['license_number'],
                'specialization' => $validated['specialization'],
                'qualification' => $validated['qualification'],
                'bio' => $validated['bio'],
                'years_of_experience' => $validated['years_of_experience'],
                'consultation_fee' => $validated['consultation_fee'],
                'max_patients_per_day' => $validated['max_patients_per_day'],
                'office_phone' => $validated['office_phone'],
                'office_room' => $validated['office_room'],
                'available_days' => $validated['available_days'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
            ]);

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
        if (!Auth::user()->hasPermission('delete-doctors')) {
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
        if (!Auth::user()->hasPermission('view-doctors')) {
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
