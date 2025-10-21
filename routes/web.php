<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\ReportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Protected routes that require authentication
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Patient Management Routes
Route::middleware(['auth'])->group(function () {
    Route::resource('patients', PatientController::class);
    Route::get('/patients/{patient}/medical-records', [PatientController::class, 'medicalRecords'])->name('patients.medical-records');
    Route::get('/patients/{patient}/prescriptions', [PatientController::class, 'prescriptions'])->name('patients.prescriptions');
    Route::get('/patients/{patient}/bills', [PatientController::class, 'bills'])->name('patients.bills');
});

// Clinic Management Routes
Route::middleware(['auth'])->group(function () {
    Route::resource('clinics', \App\Http\Controllers\ClinicController::class);
});

// Doctor Management Routes
Route::middleware(['auth'])->group(function () {
    Route::resource('doctors', \App\Http\Controllers\DoctorController::class);
});

// User Management Routes (placeholder for now)
Route::middleware(['auth'])->group(function () {
    Route::get('/users', function () {
        $patients = \App\Models\Patient::with(['user', 'primaryDoctor'])->get()->toArray();
        return Inertia::render('Patients/Index', [
            'patients' => $patients
        ]);
    })->name('users.index');
});

// Appointment Management Routes
Route::middleware(['auth'])->group(function () {
    Route::resource('appointments', AppointmentController::class);
    Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])->name('appointments.update-status');
    Route::get('/appointments/available-slots', [AppointmentController::class, 'getAvailableSlots'])->name('appointments.available-slots');
});

// Appointments Index Route
Route::middleware(['auth'])->group(function () {
    Route::get('/appointments-list', function () {
        $appointments = \App\Models\Appointment::with(['patient', 'doctor', 'clinic'])->get()->toArray();
        return Inertia::render('Appointments/Index', [
            'appointments' => $appointments
        ]);
    })->name('appointments.index');
});

// Salary Management Routes
Route::middleware(['auth'])->group(function () {
    Route::resource('salaries', SalaryController::class);
    Route::patch('/salaries/{salary}/mark-paid', [SalaryController::class, 'markAsPaid'])->name('salaries.mark-paid');
    Route::get('/salaries-stats', [SalaryController::class, 'getStats'])->name('salaries.stats');
});

// Reports and Analytics Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::post('/reports/generate', [ReportController::class, 'generate'])->name('reports.generate');
});

// Payments Management Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/payments', function () {
        $doctors = \App\Models\Doctor::with('user')->get();
        $appointments = \App\Models\Appointment::with(['patient.user', 'doctor.user'])
            ->whereMonth('scheduled_datetime', now()->month)
            ->get();

        $stats = [
            'total_revenue' => $appointments->sum('amount_received'),
            'total_center_fee' => $appointments->sum('total_center_fee'),
            'total_doctor_fee' => $appointments->sum('total_doctor_fee'),
            'total_appointments' => $appointments->count(),
        ];

        return Inertia::render('Payments/Index', [
            'doctors' => $doctors,
            'appointments' => $appointments,
            'stats' => $stats,
        ]);
    })->name('payments.index');
});

// API Routes for AJAX requests
Route::middleware(['auth'])->prefix('api')->group(function () {
    Route::get('/patients/stats', [PatientController::class, 'getStats'])->name('api.patients.stats');
    Route::get('/appointments/stats', [AppointmentController::class, 'getStats'])->name('api.appointments.stats');
    Route::get('/salaries/stats', [SalaryController::class, 'getStats'])->name('api.salaries.stats');
});

require __DIR__.'/auth.php';
