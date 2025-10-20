<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use App\Models\Clinic;
use App\Models\Doctor;
use App\Models\Patient;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        $adminRole = Role::create([
            'name' => 'admin',
            'display_name' => 'Administrator',
            'description' => 'System administrator with full access to all features',
            'is_active' => true,
        ]);

        $doctorRole = Role::create([
            'name' => 'doctor',
            'display_name' => 'Doctor',
            'description' => 'Medical professional with patient care and consultation access',
            'is_active' => true,
        ]);

        $nurseRole = Role::create([
            'name' => 'nurse',
            'display_name' => 'Nurse',
            'description' => 'Nursing staff with patient care coordination and vital signs access',
            'is_active' => true,
        ]);

        $patientRole = Role::create([
            'name' => 'patient',
            'display_name' => 'Patient',
            'description' => 'Patient with access to personal health records and appointments',
            'is_active' => true,
        ]);

        $receptionistRole = Role::create([
            'name' => 'receptionist',
            'display_name' => 'Receptionist',
            'description' => 'Front desk staff with appointment scheduling and patient registration access',
            'is_active' => true,
        ]);

        // Create admin user
        $adminUser = User::create([
            'name' => 'Hospital Administrator',
            'email' => 'admin@hospital.local',
            'password' => Hash::make('admin123'),
            'email_verified_at' => now(),
        ]);

        $adminUser->role()->associate($adminRole);
        $adminUser->save();

        // Create sample clinics
        $generalClinic = Clinic::create([
            'name' => 'General Medicine',
            'description' => 'General medical consultations and primary care',
            'location' => 'Ground Floor, Room 101',
            'phone' => '+1-555-0101',
            'email' => 'general@hospital.local',
            'start_time' => '08:00:00',
            'end_time' => '18:00:00',
            'working_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            'max_patients_per_day' => 50,
            'consultation_duration_minutes' => 30,
            'is_active' => true,
            'head_doctor_id' => null, // Will be assigned later
        ]);

        $cardiologyClinic = Clinic::create([
            'name' => 'Cardiology',
            'description' => 'Heart and cardiovascular health specialists',
            'location' => '2nd Floor, Room 205',
            'phone' => '+1-555-0205',
            'email' => 'cardiology@hospital.local',
            'start_time' => '09:00:00',
            'end_time' => '17:00:00',
            'working_days' => ['monday', 'wednesday', 'friday'],
            'max_patients_per_day' => 25,
            'consultation_duration_minutes' => 45,
            'is_active' => true,
        ]);

        $pediatricsClinic = Clinic::create([
            'name' => 'Pediatrics',
            'description' => 'Children and adolescent healthcare',
            'location' => '1st Floor, Room 103',
            'phone' => '+1-555-0103',
            'email' => 'pediatrics@hospital.local',
            'start_time' => '08:30:00',
            'end_time' => '16:30:00',
            'working_days' => ['monday', 'tuesday', 'thursday', 'friday'],
            'max_patients_per_day' => 40,
            'consultation_duration_minutes' => 25,
            'is_active' => true,
        ]);

        // Create sample doctor user
        $doctorUser = User::create([
            'name' => 'Dr. Sarah Smith',
            'email' => 'dr.smith@hospital.local',
            'password' => Hash::make('doctor123'),
            'email_verified_at' => now(),
        ]);

        $doctorUser->role()->associate($doctorRole);
        $doctorUser->save();

        // Create doctor profile
        $doctor = Doctor::create([
            'user_id' => $doctorUser->id,
            'clinic_id' => $generalClinic->id,
            'license_number' => 'MD-' . date('Y') . '-001',
            'specialization' => 'General Medicine',
            'qualification' => 'MD, MBBS',
            'bio' => 'Experienced general physician with 10+ years of practice',
            'years_of_experience' => 10,
            'consultation_fee' => 150.00,
            'max_patients_per_day' => 20,
            'office_phone' => '+1-555-0101',
            'office_room' => 'Room 101',
            'is_available' => true,
            'available_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            'start_time' => '09:00:00',
            'end_time' => '17:00:00',
        ]);

        // Update clinic head doctor
        $generalClinic->update(['head_doctor_id' => $doctorUser->id]);

        // Create sample patient user
        $patientUser = User::create([
            'name' => 'John Doe',
            'email' => 'john.doe@email.com',
            'password' => Hash::make('patient123'),
            'email_verified_at' => now(),
        ]);

        $patientUser->role()->associate($patientRole);
        $patientUser->save();

        // Create patient profile
        $patient = Patient::create([
            'user_id' => $patientUser->id,
            'patient_id' => 'PAT-' . date('Y') . '-0001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'date_of_birth' => '1985-06-15',
            'gender' => 'male',
            'phone' => '+1-555-1234',
            'emergency_contact' => 'Jane Doe',
            'emergency_phone' => '+1-555-5678',
            'address' => '123 Main St, City, State 12345',
            'blood_type' => 'O+',
            'height_cm' => 175,
            'weight_kg' => 75.5,
            'allergies' => 'Penicillin, Shellfish',
            'medical_conditions' => 'Hypertension, Occasional migraines',
            'current_medications' => 'Lisinopril 10mg daily',
            'primary_doctor_id' => $doctor->id,
            'preferred_clinic_id' => $generalClinic->id,
            'is_active' => true,
            'first_visit_date' => now(),
            'last_visit_date' => now(),
        ]);

        // Create sample receptionist user
        $receptionistUser = User::create([
            'name' => 'Lisa Johnson',
            'email' => 'receptionist@hospital.local',
            'password' => Hash::make('receptionist123'),
            'email_verified_at' => now(),
        ]);

        $receptionistUser->role()->associate($receptionistRole);
        $receptionistUser->save();

        // Create sample nurse user
        $nurseUser = User::create([
            'name' => 'Emily Davis',
            'email' => 'nurse@hospital.local',
            'password' => Hash::make('nurse123'),
            'email_verified_at' => now(),
        ]);

        $nurseUser->role()->associate($nurseRole);
        $nurseUser->save();

        $this->command->info('Hospital Management System seeded successfully!');
        $this->command->info('Login credentials:');
        $this->command->info('Admin: admin@hospital.local / admin123');
        $this->command->info('Doctor: dr.smith@hospital.local / doctor123');
        $this->command->info('Patient: john.doe@email.com / patient123');
        $this->command->info('Receptionist: receptionist@hospital.local / receptionist123');
        $this->command->info('Nurse: nurse@hospital.local / nurse123');
    }
}
