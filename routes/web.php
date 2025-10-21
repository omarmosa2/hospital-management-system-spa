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
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'status' => session('message'),
        'error' => session('error')
    ]);
})->middleware(['auth'])->name('dashboard');

// Protected routes that require authentication
Route::middleware('auth')->group(function () {
    // Common routes for all authenticated users
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Clinic Management Routes
    Route::prefix('clinics')->group(function () {
        // View routes - accessible by admin and reception
        Route::middleware('role:admin|reception')->group(function () {
            Route::get('/', [\App\Http\Controllers\ClinicController::class, 'index'])->name('clinics.index');
            Route::get('/{clinic}', [\App\Http\Controllers\ClinicController::class, 'show'])->name('clinics.show');
        });
        
        // Admin only routes - full control
        Route::middleware('role:admin')->group(function () {
            Route::post('/', [\App\Http\Controllers\ClinicController::class, 'store'])->name('clinics.store');
            Route::put('/{clinic}', [\App\Http\Controllers\ClinicController::class, 'update'])->name('clinics.update');
            Route::delete('/{clinic}', [\App\Http\Controllers\ClinicController::class, 'destroy'])->name('clinics.destroy');
        });
    });

    // Doctor Management Routes
    Route::prefix('doctors')->group(function () {
        // View routes - accessible by admin and reception
        Route::middleware('role:admin|reception')->group(function () {
            Route::get('/', [\App\Http\Controllers\DoctorController::class, 'index'])->name('doctors.index');
            Route::get('/{doctor}', [\App\Http\Controllers\DoctorController::class, 'show'])->name('doctors.show');
        });
        
        // Admin only routes - full control
        Route::middleware('role:admin')->group(function () {
            Route::post('/', [\App\Http\Controllers\DoctorController::class, 'store'])->name('doctors.store');
            Route::put('/{doctor}', [\App\Http\Controllers\DoctorController::class, 'update'])->name('doctors.update');
            Route::delete('/{doctor}', [\App\Http\Controllers\DoctorController::class, 'destroy'])->name('doctors.destroy');
        });
    });

    // Patient Management Routes
    Route::prefix('patients')->group(function () {
        // Admin can only view
        Route::middleware('role:admin|reception')->group(function () {
            Route::get('/', [PatientController::class, 'index'])->name('patients.index');
            Route::get('/{patient}', [PatientController::class, 'show'])->name('patients.show');
            Route::get('/{patient}/medical-records', [PatientController::class, 'medicalRecords'])->name('patients.medical-records');
            Route::get('/{patient}/prescriptions', [PatientController::class, 'prescriptions'])->name('patients.prescriptions');
            Route::get('/{patient}/bills', [PatientController::class, 'bills'])->name('patients.bills');
        });
        
        // Reception has full control
        Route::middleware('role:reception')->group(function () {
            Route::post('/', [PatientController::class, 'store'])->name('patients.store');
            Route::put('/{patient}', [PatientController::class, 'update'])->name('patients.update');
            Route::delete('/{patient}', [PatientController::class, 'destroy'])->name('patients.destroy');
        });
    });

    // Appointment Management Routes
    Route::prefix('appointments')->group(function () {
        // All authenticated users can view appointments (doctors see only their own)
        Route::middleware('role:admin|reception|doctor')->group(function () {
            Route::get('/', [AppointmentController::class, 'index'])->name('appointments.index');
            Route::get('/{appointment}', [AppointmentController::class, 'show'])->name('appointments.show');
        });
        
        // Reception and Admin can manage appointments
        Route::middleware('role:reception|admin')->group(function () {
            Route::post('/', [AppointmentController::class, 'store'])->name('appointments.store');
            Route::put('/{appointment}', [AppointmentController::class, 'update'])->name('appointments.update');
            Route::delete('/{appointment}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');
            Route::patch('/{appointment}/status', [AppointmentController::class, 'updateStatus'])->name('appointments.update-status');
            Route::get('/available-slots', [AppointmentController::class, 'getAvailableSlots'])->name('appointments.available-slots');
        });
    });

    // Reports Routes - Admin only
    Route::middleware('role:admin')->prefix('reports')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/export', [ReportController::class, 'export'])->name('reports.export');
    });

    // Financial Routes - Admin only
    Route::middleware('role:admin')->group(function () {
        // Payments management
        Route::prefix('payments')->group(function () {
            Route::get('/', [SalaryController::class, 'payments'])->name('payments.index');
            Route::get('/export', [SalaryController::class, 'exportPayments'])->name('payments.export');
        });

        // Salary management
        Route::prefix('salaries')->group(function () {
            Route::resource('salaries', SalaryController::class);
        });
    });

    // Doctor Salary View - Doctors can view their own salary
    Route::middleware('role:doctor')->prefix('my-salary')->group(function () {
        Route::get('/', [SalaryController::class, 'showMySalary'])->name('doctor.salary');
    });
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
