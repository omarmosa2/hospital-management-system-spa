<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InitialUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles first
        $adminRole = Role::create([
            'name' => 'admin',
            'display_name' => 'Administrator',
            'description' => 'System administrator with full access',
            'is_active' => true
        ]);

        $doctorRole = Role::create([
            'name' => 'doctor',
            'display_name' => 'Doctor',
            'description' => 'Medical professional',
            'is_active' => true
        ]);

        $patientRole = Role::create([
            'name' => 'patient',
            'display_name' => 'Patient',
            'description' => 'Patient account',
            'is_active' => true
        ]);

        // Create users with their roles
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@hospital.com',
            'password' => Hash::make('AdminPass123!'),
            'email_verified_at' => now()
        ]);
        $admin->roles()->attach($adminRole);

        $doctor = User::create([
            'name' => 'Dr. Omar',
            'email' => 'doctor@hospital.com',
            'password' => Hash::make('DoctorPass123!'),
            'email_verified_at' => now()
        ]);
        $doctor->roles()->attach($doctorRole);

        $patient = User::create([
            'name' => 'Jane Patient',
            'email' => 'patient@hospital.com',
            'password' => Hash::make('PatientPass123!'),
            'email_verified_at' => now()
        ]);
        $patient->roles()->attach($patientRole);
    }
}