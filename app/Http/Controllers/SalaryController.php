<?php

namespace App\Http\Controllers;

use App\Models\Salary;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalaryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Check if user has permission to view salaries
        if (!Auth::user()->hasPermission('view-salaries')) {
            abort(403, 'Unauthorized access to salaries management.');
        }

        $query = Salary::with(['doctor.user', 'doctor.clinic'])
            ->when($request->doctor_id, function ($q) use ($request) {
                $q->where('doctor_id', $request->doctor_id);
            })
            ->when($request->status && $request->status !== 'all', function ($q) use ($request) {
                $q->where('payment_status', $request->status);
            })
            ->when($request->period, function ($q) use ($request) {
                $q->where('salary_period', 'like', '%' . $request->period . '%');
            })
            ->orderBy('payment_date', 'desc');

        $salaries = $query->paginate(15);
        $doctors = Doctor::with('user')->get();

        return Inertia::render('Salaries/Index', [
            'salaries' => $salaries,
            'doctors' => $doctors,
            'filters' => $request->only(['doctor_id', 'status', 'period']),
            'can' => [
                'create' => Auth::user()->hasPermission('create-salaries'),
                'edit' => Auth::user()->hasPermission('edit-salaries'),
                'delete' => Auth::user()->hasPermission('delete-salaries'),
                'pay' => Auth::user()->hasPermission('pay-salaries'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Check if user has permission to create salaries
        if (!Auth::user()->hasPermission('create-salaries')) {
            abort(403, 'Unauthorized to create salary records.');
        }

        $doctors = Doctor::with(['user', 'clinic'])->get();

        return Inertia::render('Salaries/Create', [
            'doctors' => $doctors
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check if user has permission to create salaries
        if (!Auth::user()->hasPermission('create-salaries')) {
            abort(403, 'Unauthorized to create salary records.');
        }

        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'base_salary' => 'required|numeric|min:0',
            'bonus_amount' => 'required|numeric|min:0',
            'deduction_amount' => 'required|numeric|min:0',
            'salary_period' => 'required|string|max:50',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
            'salary_components' => 'nullable|array',
        ]);

        // Check if salary already exists for this doctor and period
        $existingSalary = Salary::where('doctor_id', $validated['doctor_id'])
                               ->where('salary_period', $validated['salary_period'])
                               ->first();

        if ($existingSalary) {
            return back()->withErrors([
                'salary_period' => 'رقم راتب موجود مسبقًا لهذا الطبيب في نفس الفترة.'
            ]);
        }

        // Calculate total salary
        $totalSalary = $validated['base_salary'] + $validated['bonus_amount'] - $validated['deduction_amount'];

        $salary = Salary::create(array_merge($validated, [
            'total_salary' => $totalSalary,
            'payment_status' => 'pending',
        ]));

        return redirect()->route('salaries.index')
                        ->with('message', 'تم إنشاء سجل الراتب بنجاح');
    }

    /**
     * Display the specified resource.
     */
    public function show(Salary $salary)
    {
        // Check if user has permission to view salaries
        if (!Auth::user()->hasPermission('view-salaries')) {
            abort(403, 'Unauthorized access to salary details.');
        }

        $salary->load(['doctor.user', 'doctor.clinic']);

        return Inertia::render('Salaries/Show', [
            'salary' => $salary,
            'can' => [
                'edit' => Auth::user()->hasPermission('edit-salaries'),
                'delete' => Auth::user()->hasPermission('delete-salaries'),
                'pay' => Auth::user()->hasPermission('pay-salaries'),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Salary $salary)
    {
        // Check if user has permission to edit salaries
        if (!Auth::user()->hasPermission('edit-salaries')) {
            abort(403, 'Unauthorized to edit salary records.');
        }

        // Don't allow editing paid salaries
        if ($salary->isPaid()) {
            return back()->withErrors([
                'salary' => 'لا يمكن تعديل سجل راتب مدفوع.'
            ]);
        }

        $doctors = Doctor::with(['user', 'clinic'])->get();

        return Inertia::render('Salaries/Edit', [
            'salary' => $salary,
            'doctors' => $doctors
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Salary $salary)
    {
        // Check if user has permission to edit salaries
        if (!Auth::user()->hasPermission('edit-salaries')) {
            abort(403, 'Unauthorized to edit salary records.');
        }

        // Don't allow editing paid salaries
        if ($salary->isPaid()) {
            return back()->withErrors([
                'salary' => 'لا يمكن تعديل سجل راتب مدفوع.'
            ]);
        }

        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'base_salary' => 'required|numeric|min:0',
            'bonus_amount' => 'required|numeric|min:0',
            'deduction_amount' => 'required|numeric|min:0',
            'salary_period' => 'required|string|max:50',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
            'salary_components' => 'nullable|array',
        ]);

        // Check if another salary exists for this doctor and period (excluding current salary)
        $existingSalary = Salary::where('doctor_id', $validated['doctor_id'])
                               ->where('salary_period', $validated['salary_period'])
                               ->where('id', '!=', $salary->id)
                               ->first();

        if ($existingSalary) {
            return back()->withErrors([
                'salary_period' => 'رقم راتب موجود مسبقًا لهذا الطبيب في نفس الفترة.'
            ]);
        }

        // Calculate total salary
        $totalSalary = $validated['base_salary'] + $validated['bonus_amount'] - $validated['deduction_amount'];

        $salary->update(array_merge($validated, [
            'total_salary' => $totalSalary,
        ]));

        return redirect()->route('salaries.index')
                        ->with('message', 'تم تحديث سجل الراتب بنجاح');
    }

    /**
     * Mark salary as paid
     */
    public function markAsPaid(Request $request, Salary $salary)
    {
        // Check if user has permission to pay salaries
        if (!Auth::user()->hasPermission('pay-salaries')) {
            abort(403, 'Unauthorized to process salary payments.');
        }

        if ($salary->isPaid()) {
            return back()->withErrors([
                'salary' => 'هذا الراتب مدفوع مسبقًا.'
            ]);
        }

        $salary->update([
            'payment_status' => 'paid',
            'payment_date' => now(),
        ]);

        return redirect()->back()
                        ->with('message', 'تم تأكيد دفع الراتب بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Salary $salary)
    {
        // Check if user has permission to delete salaries
        if (!Auth::user()->hasPermission('delete-salaries')) {
            abort(403, 'Unauthorized to delete salary records.');
        }

        // Don't allow deleting paid salaries
        if ($salary->isPaid()) {
            return back()->withErrors([
                'salary' => 'لا يمكن حذف سجل راتب مدفوع.'
            ]);
        }

        $salary->delete();

        return redirect()->route('salaries.index')
                        ->with('message', 'تم حذف سجل الراتب بنجاح');
    }

    /**
     * Get salary statistics for dashboard
     */
    public function getStats()
    {
        if (!Auth::user()->hasPermission('view-salaries')) {
            abort(403);
        }

        $currentMonth = now()->format('Y-m');

        $stats = [
            'total_salaries_this_month' => Salary::where('salary_period', 'like', $currentMonth . '%')->count(),
            'total_amount_this_month' => Salary::where('salary_period', 'like', $currentMonth . '%')->sum('total_salary'),
            'pending_salaries' => Salary::where('payment_status', 'pending')->count(),
            'pending_amount' => Salary::where('payment_status', 'pending')->sum('total_salary'),
            'paid_salaries' => Salary::where('payment_status', 'paid')->count(),
            'paid_amount' => Salary::where('payment_status', 'paid')->sum('total_salary'),
        ];

        return response()->json($stats);
    }
    /**
     * Show doctor's own salary information
     */
    public function showMySalary()
    {
        $user = Auth::user();

        if (!$user->isDoctor()) {
            abort(403, 'Unauthorized access.');
        }

        $doctor = $user->doctor;
        if (!$doctor) {
            abort(403, 'Doctor profile not found.');
        }

        $currentMonth = now()->format('Y-m');
        $salaries = Salary::where('doctor_id', $doctor->id)
            ->where('salary_period', 'like', $currentMonth . '%')
            ->orderBy('payment_date', 'desc')
            ->get();

        $stats = [
            'total_earned_this_month' => $salaries->sum('total_salary'),
            'paid_salaries' => $salaries->where('payment_status', 'paid')->count(),
            'pending_salaries' => $salaries->where('payment_status', 'pending')->count(),
        ];

        return Inertia::render('Salaries/MySalary', [
            'salaries' => $salaries,
            'stats' => $stats,
            'doctor' => $doctor->load('user', 'clinic')
        ]);
    }

    /**
     * Display payments management page
     */
    public function payments()
    {
        // Check if user has permission to view payments
        if (!Auth::user()->hasPermission('view-payments')) {
            abort(403, 'Unauthorized access to payments management.');
        }

        $doctors = \App\Models\Doctor::with('user')->get();
        $appointments = \App\Models\Appointment::with(['patient.user', 'doctor.user'])
            ->whereMonth('scheduled_datetime', now()->month)
            ->where('status', 'completed')
            ->get();

        $stats = [
            'total_revenue' => $appointments->sum('amount_received'),
            'total_center_fee' => $appointments->sum('total_center_fee'),
            'total_doctor_fee' => $appointments->sum('total_doctor_fee'),
            'total_appointments' => $appointments->count(),
            'net_profit' => $appointments->sum('total_center_fee') - $appointments->sum('total_doctor_fee'),
        ];

        return Inertia::render('Payments/Index', [
            'doctors' => $doctors,
            'appointments' => $appointments,
            'stats' => $stats,
            'can' => [
                'export' => Auth::user()->hasPermission('export-reports'),
            ]
        ]);
    }

    /**
     * Export payments data
     */
    public function exportPayments(Request $request)
    {
        if (!Auth::user()->hasPermission('export-reports')) {
            abort(403, 'Unauthorized to export payments.');
        }

        // This would integrate with Laravel Excel package
        // For now, return JSON response
        $appointments = \App\Models\Appointment::with(['patient.user', 'doctor.user'])
            ->where('status', 'completed')
            ->when($request->month, function ($q) use ($request) {
                $q->whereMonth('scheduled_datetime', $request->month);
            })
            ->when($request->year, function ($q) use ($request) {
                $q->whereYear('scheduled_datetime', $request->year);
            })
            ->get();

        $data = [
            'appointments' => $appointments,
            'summary' => [
                'total_revenue' => $appointments->sum('amount_received'),
                'total_center_fee' => $appointments->sum('total_center_fee'),
                'total_doctor_fee' => $appointments->sum('total_doctor_fee'),
                'net_profit' => $appointments->sum('total_center_fee') - $appointments->sum('total_doctor_fee'),
            ],
            'exported_at' => now()->format('Y-m-d H:i:s'),
        ];

        return response()->json([
            'message' => 'Export functionality would be implemented with Laravel Excel',
            'data' => $data,
            'filename' => 'payments_export_' . now()->format('Y-m-d_H-i-s') . '.xlsx'
        ]);
    }
}
