<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Clinic;
use App\Models\MedicalRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Display reports dashboard
     */
    public function index()
    {
        // Check if user has permission to view reports
        if (!Auth::user()->hasPermission('view-reports')) {
            abort(403, 'Unauthorized access to reports.');
        }

        // Get comprehensive statistics
        $stats = [
            'total_patients' => Patient::count(),
            'total_doctors' => Doctor::count(),
            'total_appointments' => Appointment::count(),
            'total_clinics' => Clinic::count(),
            'today_appointments' => Appointment::whereDate('scheduled_datetime', today())->count(),
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'pending_appointments' => Appointment::where('status', 'scheduled')->count(),
            'cancelled_appointments' => Appointment::where('status', 'cancelled')->count(),
        ];

        // Monthly appointments chart data (last 12 months)
        $monthlyAppointments = Appointment::selectRaw('MONTH(scheduled_datetime) as month, YEAR(scheduled_datetime) as year, COUNT(*) as count')
            ->where('scheduled_datetime', '>=', now()->subMonths(12))
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        // Doctor performance data
        $doctorPerformance = Doctor::with(['user', 'appointments' => function($query) {
            $query->where('status', 'completed')
                  ->whereMonth('scheduled_datetime', now()->month);
        }])->withCount(['appointments as completed_this_month' => function($query) {
            $query->where('status', 'completed')
                  ->whereMonth('scheduled_datetime', now()->month);
        }])->get();

        // Clinic utilization
        $clinicUtilization = Clinic::withCount('appointments')->get();

        return Inertia::render('Reports/Index', [
            'stats' => $stats,
            'monthlyAppointments' => $monthlyAppointments,
            'doctorPerformance' => $doctorPerformance,
            'clinicUtilization' => $clinicUtilization,
            'can' => [
                'generate' => Auth::user()->hasPermission('generate-reports'),
                'export' => Auth::user()->hasPermission('export-reports'),
            ]
        ]);
    }

    /**
     * Generate specific report
     */
    public function generate(Request $request)
    {
        if (!Auth::user()->hasPermission('generate-reports')) {
            abort(403, 'Unauthorized to generate reports.');
        }

        $validated = $request->validate([
            'report_type' => 'required|in:appointments,patients,doctors,financial,revenue',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'format' => 'required|in:screen,excel,pdf',
        ]);

        switch ($validated['report_type']) {
            case 'appointments':
                return $this->generateAppointmentsReport($validated);
            case 'patients':
                return $this->generatePatientsReport($validated);
            case 'doctors':
                return $this->generateDoctorsReport($validated);
            case 'financial':
                return $this->generateFinancialReport($validated);
            case 'revenue':
                return $this->generateRevenueReport($validated);
            default:
                abort(400, 'Invalid report type');
        }
    }

    /**
     * Generate appointments report
     */
    private function generateAppointmentsReport($params)
    {
        $appointments = Appointment::with(['patient.user', 'doctor.user', 'clinic'])
            ->whereBetween('scheduled_datetime', [$params['date_from'], $params['date_to']])
            ->orderBy('scheduled_datetime')
            ->get();

        $reportData = [
            'title' => 'تقرير المواعيد',
            'period' => $params['date_from'] . ' إلى ' . $params['date_to'],
            'total_appointments' => $appointments->count(),
            'completed_appointments' => $appointments->where('status', 'completed')->count(),
            'cancelled_appointments' => $appointments->where('status', 'cancelled')->count(),
            'pending_appointments' => $appointments->where('status', 'scheduled')->count(),
            'appointments' => $appointments,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];

        if ($params['format'] === 'excel') {
            return $this->exportToExcel($reportData, 'appointments_report');
        }

        return Inertia::render('Reports/AppointmentsReport', [
            'reportData' => $reportData
        ]);
    }

    /**
     * Generate patients report
     */
    private function generatePatientsReport($params)
    {
        $patients = Patient::with(['user', 'primaryDoctor.user', 'appointments' => function($query) use ($params) {
            $query->whereBetween('scheduled_datetime', [$params['date_from'], $params['date_to']]);
        }])->whereBetween('created_at', [$params['date_from'], $params['date_to']])
          ->get();

        $reportData = [
            'title' => 'تقرير المرضى',
            'period' => $params['date_from'] . ' إلى ' . $params['date_to'],
            'total_patients' => $patients->count(),
            'new_patients_this_period' => $patients->count(),
            'patients_with_appointments' => $patients->filter(function($patient) {
                return $patient->appointments->count() > 0;
            })->count(),
            'patients' => $patients,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];

        if ($params['format'] === 'excel') {
            return $this->exportToExcel($reportData, 'patients_report');
        }

        return Inertia::render('Reports/PatientsReport', [
            'reportData' => $reportData
        ]);
    }

    /**
     * Generate doctors report
     */
    private function generateDoctorsReport($params)
    {
        $doctors = Doctor::with(['user', 'clinic', 'appointments' => function($query) use ($params) {
            $query->whereBetween('scheduled_datetime', [$params['date_from'], $params['date_to']]);
        }])->withCount(['appointments as appointments_count' => function($query) use ($params) {
            $query->whereBetween('scheduled_datetime', [$params['date_from'], $params['date_to']]);
        }])->get();

        $reportData = [
            'title' => 'تقرير الأطباء',
            'period' => $params['date_from'] . ' إلى ' . $params['date_to'],
            'total_doctors' => $doctors->count(),
            'doctors_with_appointments' => $doctors->where('appointments_count', '>', 0)->count(),
            'total_appointments' => $doctors->sum('appointments_count'),
            'doctors' => $doctors,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];

        if ($params['format'] === 'excel') {
            return $this->exportToExcel($reportData, 'doctors_report');
        }

        return Inertia::render('Reports/DoctorsReport', [
            'reportData' => $reportData
        ]);
    }

    /**
     * Generate financial report
     */
    private function generateFinancialReport($params)
    {
        // This would integrate with billing/invoicing system
        $reportData = [
            'title' => 'التقرير المالي',
            'period' => $params['date_from'] . ' إلى ' . $params['date_to'],
            'total_revenue' => 0,
            'total_expenses' => 0,
            'net_profit' => 0,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];

        return Inertia::render('Reports/FinancialReport', [
            'reportData' => $reportData
        ]);
    }

    /**
     * Generate revenue report
     */
    private function generateRevenueReport($params)
    {
        $appointments = Appointment::with(['doctor', 'clinic'])
            ->whereBetween('scheduled_datetime', [$params['date_from'], $params['date_to']])
            ->where('status', 'completed')
            ->get();

        $totalRevenue = $appointments->sum(function($appointment) {
            return $appointment->doctor?->consultation_fee ?? 0;
        });

        $reportData = [
            'title' => 'تقرير الإيرادات',
            'period' => $params['date_from'] . ' إلى ' . $params['date_to'],
            'total_revenue' => $totalRevenue,
            'total_appointments' => $appointments->count(),
            'average_revenue_per_appointment' => $appointments->count() > 0 ? $totalRevenue / $appointments->count() : 0,
            'appointments' => $appointments,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];

        if ($params['format'] === 'excel') {
            return $this->exportToExcel($reportData, 'revenue_report');
        }

        return Inertia::render('Reports/RevenueReport', [
            'reportData' => $reportData
        ]);
    }

    /**
     * Export report to Excel
     */
    private function exportToExcel($data, $filename)
    {
        // This would integrate with Laravel Excel package
        // For now, return JSON response
        return response()->json([
            'message' => 'Export functionality would be implemented with Laravel Excel',
            'data' => $data,
            'filename' => $filename . '_' . now()->format('Y-m-d_H-i-s') . '.xlsx'
        ]);
    }
}
