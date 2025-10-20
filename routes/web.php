<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AppointmentController;
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

// API Routes for AJAX requests
Route::middleware(['auth'])->prefix('api')->group(function () {
    Route::get('/patients/stats', [PatientController::class, 'getStats'])->name('api.patients.stats');
    Route::get('/appointments/stats', [AppointmentController::class, 'getStats'])->name('api.appointments.stats');
});

require __DIR__.'/auth.php';
