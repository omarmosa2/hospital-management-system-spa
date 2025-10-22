<?php

namespace App\Http\Controllers;

use App\Models\Clinic;
use App\Models\ClinicSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClinicScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Check if user has permission to view clinic schedules
        if (!Auth::user()->hasPermission('view-clinics')) {
            abort(403, 'Unauthorized access to clinic schedules.');
        }

        $clinicSchedules = ClinicSchedule::with('clinic')
            ->orderBy('clinic_id')
            ->orderBy('day_of_week')
            ->get()
            ->groupBy('clinic_id');

        return Inertia::render('ClinicSchedules/Index', [
            'clinicSchedules' => $clinicSchedules,
            'can' => [
                'create' => Auth::user()->hasPermission('create-clinics'),
                'edit' => Auth::user()->hasPermission('edit-clinics'),
                'delete' => Auth::user()->hasPermission('delete-clinics'),
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
        // Check if user has permission to create clinic schedules
        if (!Auth::user()->hasPermission('create-clinics')) {
            abort(403, 'Unauthorized to create clinic schedules.');
        }

        $clinics = Clinic::where('is_active', true)->get();

        return Inertia::render('ClinicSchedules/Create', [
            'clinics' => $clinics
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check if user has permission to create clinic schedules
        if (!Auth::user()->hasPermission('create-clinics')) {
            abort(403, 'Unauthorized to create clinic schedules.');
        }

        $validated = $request->validate([
            'clinic_id' => 'required|exists:clinics,id',
            'day_of_week' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'open_time' => 'required|date_format:H:i',
            'close_time' => 'required|date_format:H:i|after:open_time',
            'is_closed' => 'nullable|boolean',
        ]);

        ClinicSchedule::create($validated);

        return redirect()->route('clinic-schedules.index')
                        ->with('message', 'تم إضافة جدول الدوام بنجاح');
    }

    /**
     * Display the specified resource.
     */
    public function show(ClinicSchedule $clinicSchedule)
    {
        // Check if user has permission to view clinic schedules
        if (!Auth::user()->hasPermission('view-clinics')) {
            abort(403, 'Unauthorized access to clinic schedule details.');
        }

        $clinicSchedule->load('clinic');

        return Inertia::render('ClinicSchedules/Show', [
            'clinicSchedule' => $clinicSchedule,
            'can' => [
                'edit' => Auth::user()->hasPermission('edit-clinics'),
                'delete' => Auth::user()->hasPermission('delete-clinics'),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ClinicSchedule $clinicSchedule)
    {
        // Check if user has permission to edit clinic schedules
        if (!Auth::user()->hasPermission('edit-clinics')) {
            abort(403, 'Unauthorized to edit clinic schedules.');
        }

        $clinics = Clinic::where('is_active', true)->get();

        return Inertia::render('ClinicSchedules/Edit', [
            'clinicSchedule' => $clinicSchedule,
            'clinics' => $clinics
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ClinicSchedule $clinicSchedule)
    {
        // Check if user has permission to edit clinic schedules
        if (!Auth::user()->hasPermission('edit-clinics')) {
            abort(403, 'Unauthorized to edit clinic schedules.');
        }

        $validated = $request->validate([
            'clinic_id' => 'required|exists:clinics,id',
            'day_of_week' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'open_time' => 'required|date_format:H:i',
            'close_time' => 'required|date_format:H:i|after:open_time',
            'is_closed' => 'nullable|boolean',
        ]);

        $clinicSchedule->update($validated);

        return redirect()->route('clinic-schedules.index')
                        ->with('message', 'تم تحديث جدول الدوام بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ClinicSchedule $clinicSchedule)
    {
        // Check if user has permission to delete clinic schedules
        if (!Auth::user()->hasPermission('delete-clinics')) {
            abort(403, 'Unauthorized to delete clinic schedules.');
        }

        $clinicSchedule->delete();

        return redirect()->route('clinic-schedules.index')
                        ->with('message', 'تم حذف جدول الدوام بنجاح');
    }
}
