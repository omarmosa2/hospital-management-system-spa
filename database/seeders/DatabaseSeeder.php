<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create or retrieve roles
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            [
                'display_name' => 'Administrator',
                'description' => 'System administrator with full access',
                'is_active' => true
            ]
        );

        $receptionistRole = Role::firstOrCreate(
            ['name' => 'receptionist'],
            [
                'display_name' => 'Receptionist',
                'description' => 'Front desk receptionist',
                'is_active' => true
            ]
        );

        $doctorRole = Role::firstOrCreate(
            ['name' => 'doctor'],
            [
                'display_name' => 'Doctor',
                'description' => 'Medical professional',
                'is_active' => true
            ]
        );

        $nurseRole = Role::firstOrCreate(
            ['name' => 'nurse'],
            [
                'display_name' => 'Nurse',
                'description' => 'Medical nurse',
                'is_active' => true
            ]
        );

        $patientRole = Role::firstOrCreate(
            ['name' => 'patient'],
            [
                'display_name' => 'Patient',
                'description' => 'Patient account',
                'is_active' => true
            ]
        );

        // Create or update admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@hospital.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('AdminPass123!'),
                'email_verified_at' => now()
            ]
        );
        $admin->roles()->sync([$adminRole->id]);

        // Create or update receptionist user
        $receptionist = User::updateOrCreate(
            ['email' => 'reception@hospital.com'],
            [
                'name' => 'Sarah Receptionist',
                'password' => Hash::make('ReceptionPass123!'),
                'email_verified_at' => now()
            ]
        );
        $receptionist->roles()->sync([$receptionistRole->id]);

        // Create or update doctor user
        $doctor = User::updateOrCreate(
            ['email' => 'doctor@hospital.com'],
            [
                'name' => 'Dr. Omar',
                'password' => Hash::make('DoctorPass123!'),
                'email_verified_at' => now()
            ]
        );
        $doctor->roles()->sync([$doctorRole->id]);

        // Create or update patient user
        $patient = User::updateOrCreate(
            ['email' => 'patient@hospital.com'],
            [
                'name' => 'Jane Patient',
                'password' => Hash::make('PatientPass123!'),
                'email_verified_at' => now()
            ]
        );
        $patient->roles()->sync([$patientRole->id]);

        // Setup standard permissions
        User::setupStandardPermissions();
    }
}
