<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ClinicController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;



Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    $user = auth()->user();
    if (!$user) {
        return redirect()->route('login');
    }

    // Get user permissions
    $permissions = [];
    if ($user) {
        foreach ($user->roles as $role) {
            $permissions = array_merge($permissions, $role->permissions->pluck('name')->toArray());
        }
        $permissions = array_unique($permissions);
    }

    // Get stats based on user role
    $stats = [];
    if ($user && $user->roles->isNotEmpty()) {
        $primaryRole = $user->roles->first();

        switch ($primaryRole->name) {
            case 'admin':
                $stats = [
                    'admin' => [
                        'totalUsers' => \App\Models\User::count(),
                        'totalPatients' => \App\Models\Patient::count(),
                        'totalDoctors' => \App\Models\Doctor::count(),
                        'todayAppointments' => \App\Models\Appointment::whereDate('scheduled_datetime', today())->count(),
                        'totalRevenue' => \App\Models\Bill::whereMonth('created_at', now()->month)->sum('total_amount'),
                    ]
                ];
                break;
            case 'doctor':
                $doctor = $user->doctor;
                $stats = [
                    'doctor' => [
                        'todayAppointments' => $doctor ? $doctor->appointments()->whereDate('scheduled_datetime', today())->count() : 0,
                        'totalPatients' => $doctor ? $doctor->patients()->count() : 0,
                        'pendingRecords' => $doctor ? $doctor->medicalRecords()->where('status', 'pending')->count() : 0,
                        'completedToday' => $doctor ? $doctor->medicalRecords()->whereDate('created_at', today())->count() : 0,
                    ]
                ];
                break;
            case 'receptionist':
                $stats = [
                    'receptionist' => [
                        'todayAppointments' => \App\Models\Appointment::whereDate('scheduled_datetime', today())->count(),
                        'totalPatients' => \App\Models\Patient::count(),
                        'pendingAppointments' => \App\Models\Appointment::where('status', 'pending')->count(),
                    ]
                ];
                break;
            case 'patient':
                $patient = $user->patient;
                $stats = [
                    'patient' => [
                        'myAppointments' => $patient ? $patient->appointments()->where('appointment_date', '>=', today())->count() : 0,
                        'medicalRecords' => $patient ? $patient->medicalRecords()->count() : 0,
                        'bills' => $patient ? $patient->bills()->where('status', 'unpaid')->count() : 0,
                    ]
                ];
                break;
        }
    }

    // Get recent activity logs
    $activityLogs = \App\Models\ActivityLog::with('user')
        ->latest()
        ->take(10)
        ->get()
        ->map(function ($log) {
            return [
                'id' => $log->id,
                'action' => $log->event ?: 'activity',
                'description' => $log->description,
                'user_name' => $log->user ? $log->user->name : 'System',
                'created_at' => $log->created_at,
            ];
        })->toArray();

    return Inertia::render('Dashboard/UnifiedDashboard', [
        'status' => session('message'),
        'error' => session('error'),
        'stats' => $stats,
        'permissions' => $permissions,
        'activityLogs' => $activityLogs,
    ]);
})->middleware(['auth'])->name('dashboard');

// Login and logout routes for Inertia
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

// Protected routes that require authentication
Route::middleware('auth')->group(function () {
    // Common routes for all authenticated users
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Clinic Management Routes
    Route::prefix('clinics')->group(function () {
        // View routes - accessible by admin and reception
        Route::middleware('role:admin|receptionist')->group(function () {
            Route::get('/', [ClinicController::class, 'index'])->name('clinics.index');
            Route::get('/search', [ClinicController::class, 'search'])->name('clinics.search');
            Route::get('/stats', [ClinicController::class, 'getStats'])->name('clinics.stats');
            Route::get('/{clinic}', [ClinicController::class, 'show'])->name('clinics.show');
            Route::get('/export', [ClinicController::class, 'export'])->name('clinics.export');
        });

        // Admin only routes - full control
        Route::middleware('role:admin')->group(function () {
            Route::get('/create', [ClinicController::class, 'create'])->name('clinics.create');
            Route::post('/', [ClinicController::class, 'store'])->name('clinics.store');
            Route::get('/{clinic}/edit', [ClinicController::class, 'edit'])->name('clinics.edit');
            Route::put('/{clinic}', [ClinicController::class, 'update'])->name('clinics.update');
            Route::delete('/{clinic}', [ClinicController::class, 'destroy'])->name('clinics.destroy');
        });
    });

    // Doctor Management Routes
    Route::prefix('doctors')->group(function () {
        // All doctor routes for admin only for now (simplified)
        Route::middleware('role:admin')->group(function () {
            Route::get('/', [DoctorController::class, 'index'])->name('doctors.index');
            Route::get('/create', [DoctorController::class, 'create'])->name('doctors.create');
            Route::post('/', [DoctorController::class, 'store'])->name('doctors.store');
            Route::get('/{doctor}', [DoctorController::class, 'show'])->name('doctors.show');
            Route::get('/{doctor}/edit', [DoctorController::class, 'edit'])->name('doctors.edit');
            Route::put('/{doctor}', [DoctorController::class, 'update'])->name('doctors.update');
            Route::delete('/{doctor}', [DoctorController::class, 'destroy'])->name('doctors.destroy');
        });
    });

    // Patient Management Routes
    Route::prefix('patients')->group(function () {
        // Admin and Reception can manage patients (add, edit, delete)
        Route::middleware('role:admin|receptionist')->group(function () {
            Route::get('/', [PatientController::class, 'index'])->name('patients.index');
            Route::get('/create', [PatientController::class, 'create'])->name('patients.create');
            Route::post('/', [PatientController::class, 'store'])->name('patients.store');
            Route::get('/{patient}', [PatientController::class, 'show'])->name('patients.show');
            Route::get('/{patient}/edit', [PatientController::class, 'edit'])->name('patients.edit');
            Route::put('/{patient}', [PatientController::class, 'update'])->name('patients.update');
            Route::delete('/{patient}', [PatientController::class, 'destroy'])->name('patients.destroy');
            Route::get('/{patient}/medical-records', [PatientController::class, 'medicalRecords'])->name('patients.medical-records');
            Route::get('/{patient}/prescriptions', [PatientController::class, 'prescriptions'])->name('patients.prescriptions');
            Route::get('/{patient}/bills', [PatientController::class, 'bills'])->name('patients.bills');
        });
    });

    // Doctor Patient Viewing Routes - Doctors can only view their assigned patients
    Route::prefix('my-patients')->group(function () {
        Route::middleware('role:doctor')->group(function () {
            Route::get('/', [App\Http\Controllers\DoctorPatientsController::class, 'index'])->name('doctor.patients.index');
            Route::get('/{patient}', [App\Http\Controllers\DoctorPatientsController::class, 'show'])->name('doctor.patients.show');
        });
    });

    // Appointment Management Routes
    Route::prefix('appointments')->group(function () {
        // All authenticated users can view appointments (doctors see only their own)
        Route::middleware('role:admin|receptionist|doctor')->group(function () {
            Route::get('/', [AppointmentController::class, 'index'])->name('appointments.index');
            Route::get('/{appointment}', [AppointmentController::class, 'show'])->name('appointments.show');
        });

        // Reception and Admin can manage appointments
        Route::middleware('role:receptionist|admin')->group(function () {
            Route::post('/', [AppointmentController::class, 'store'])->name('appointments.store');
            Route::put('/{appointment}', [AppointmentController::class, 'update'])->name('appointments.update');
            Route::delete('/{appointment}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');
            Route::patch('/{appointment}/status', [AppointmentController::class, 'updateStatus'])->name('appointments.update-status');
            Route::get('/available-slots', [AppointmentController::class, 'getAvailableSlots'])->name('appointments.available-slots');
        });
    });



    // Doctor Salary View - Doctors can view their own salary
    Route::middleware('role:doctor')->prefix('my-salary')->group(function () {
        Route::get('/', [SalaryController::class, 'showMySalary'])->name('doctor.salary');
    });

    // Reports Routes - Admin only (doctors and others cannot access)
    Route::middleware('role:admin')->prefix('reports')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('reports.index');
        Route::post('/generate', [ReportController::class, 'generate'])->name('reports.generate');
        Route::get('/export', [ReportController::class, 'export'])->name('reports.export');
    });

    // Payments and Salary Management Routes - Admin only
    Route::middleware('role:admin')->group(function () {
        // Payments management
        Route::prefix('payments')->group(function () {
            Route::get('/', [SalaryController::class, 'payments'])->name('payments.index');
            Route::get('/export', [SalaryController::class, 'exportPayments'])->name('payments.export');
        });

        // Salary management
        Route::prefix('salaries')->group(function () {
            Route::get('/', [SalaryController::class, 'index'])->name('salaries.index');
            Route::get('/create', [SalaryController::class, 'create'])->name('salaries.create');
            Route::post('/', [SalaryController::class, 'store'])->name('salaries.store');
            Route::get('/{salary}', [SalaryController::class, 'show'])->name('salaries.show');
            Route::get('/{salary}/edit', [SalaryController::class, 'edit'])->name('salaries.edit');
            Route::put('/{salary}', [SalaryController::class, 'update'])->name('salaries.update');
            Route::delete('/{salary}', [SalaryController::class, 'destroy'])->name('salaries.destroy');
            Route::patch('/{salary}/mark-paid', [SalaryController::class, 'markAsPaid'])->name('salaries.mark-paid');
        });

        Route::get('/salaries-stats', [SalaryController::class, 'getStats'])->name('salaries.stats');

        // Patient export
        Route::get('/patients/export', [PatientController::class, 'export'])->name('patients.export');
    });
});

// API Routes for AJAX requests - Restrict based on roles
Route::middleware(['auth'])->prefix('api')->group(function () {
    Route::middleware('role:admin|receptionist')->group(function () {
        Route::get('/patients/stats', [PatientController::class, 'getStats'])->name('api.patients.stats');
        Route::get('/appointments/stats', [AppointmentController::class, 'getStats'])->name('api.appointments.stats');
    });
    Route::middleware('role:doctor')->group(function () {
        Route::get('/doctor-patients/stats', [App\Http\Controllers\DoctorPatientsController::class, 'getStats'])->name('api.doctor.patients.stats');
    });
    Route::middleware('role:admin')->group(function () {
        Route::get('/salaries/stats', [SalaryController::class, 'getStats'])->name('api.salaries.stats');
    });

    // Activity logging
    Route::post('/activity-log', function (Request $request) {
        $request->validate([
            'action' => 'required|string',
            'details' => 'required|string',
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string',
        ]);

        \App\Models\ActivityLog::create([
            'log_name' => 'user_activity',
            'description' => $request->details,
            'event' => $request->action,
            'causer_type' => \App\Models\User::class,
            'causer_id' => $request->user_id,
            'properties' => [
                'role' => $request->role,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ],
        ]);

        return response()->json(['message' => 'Activity logged successfully']);
    })->name('api.activity-log');
});

// Admin routes for role switching (testing purposes)
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::post('/switch-role', [App\Http\Controllers\Admin\RoleSwitchController::class, 'switchRole'])->name('admin.switch-role');
    Route::post('/restore-role', [App\Http\Controllers\Admin\RoleSwitchController::class, 'restoreRole'])->name('admin.restore-role');
    Route::get('/available-roles', [App\Http\Controllers\Admin\RoleSwitchController::class, 'getAvailableRoles'])->name('admin.available-roles');
});

require __DIR__.'/auth.php';
