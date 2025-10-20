<?php

namespace App\Http\Controllers;

use App\Models\Clinic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

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

        $clinics = Clinic::with(['headDoctor.user', 'doctors.user'])
                        ->orderBy('name')
                        ->get()
                        ->toArray();

        return Inertia::render('Clinics/Index', [
            'clinics' => $clinics,
            'can' => [
                'create' => Auth::user()->hasPermission('create-clinics'),
                'edit' => Auth::user()->hasPermission('edit-clinics'),
                'delete' => Auth::user()->hasPermission('delete-clinics'),
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
    public function store(Request $request)
    {
        // Check if user has permission to create clinics
        if (!Auth::user()->hasPermission('create-clinics')) {
            abort(403, 'Unauthorized to create clinics.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|unique:clinics,email',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'working_days' => 'required|array|min:1',
            'working_days.*' => 'string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'max_patients_per_day' => 'required|integer|min:1|max:200',
            'consultation_duration_minutes' => 'required|integer|min:5|max:120',
            'head_doctor_id' => 'nullable|exists:users,id',
        ]);

        $clinic = Clinic::create($validated);

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

        $clinic->load(['headDoctor.user', 'doctors.user']);

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
    public function update(Request $request, Clinic $clinic)
    {
        // Check if user has permission to edit clinics
        if (!Auth::user()->canPerform('edit-clinics')) {
            abort(403, 'Unauthorized to edit clinics.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|unique:clinics,email,' . $clinic->id,
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'working_days' => 'required|array|min:1',
            'working_days.*' => 'string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'max_patients_per_day' => 'required|integer|min:1|max:200',
            'consultation_duration_minutes' => 'required|integer|min:5|max:120',
            'head_doctor_id' => 'nullable|exists:users,id',
        ]);

        $clinic->update($validated);

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
            'total_doctors' => Clinic::with('doctors')->get()->sum(function($clinic) {
                return $clinic->doctors->count();
            }),
        ];

        return response()->json($stats);
    }
}
