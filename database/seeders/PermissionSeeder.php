<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions for different modules
        $permissions = [
            // User Management
            ['name' => 'view-users', 'display_name' => 'View Users', 'module' => 'users', 'description' => 'Can view users list'],
            ['name' => 'create-users', 'display_name' => 'Create Users', 'module' => 'users', 'description' => 'Can create new users'],
            ['name' => 'edit-users', 'display_name' => 'Edit Users', 'module' => 'users', 'description' => 'Can edit user information'],
            ['name' => 'delete-users', 'display_name' => 'Delete Users', 'module' => 'users', 'description' => 'Can delete users'],

            // Role Management
            ['name' => 'view-roles', 'display_name' => 'View Roles', 'module' => 'roles', 'description' => 'Can view roles'],
            ['name' => 'create-roles', 'display_name' => 'Create Roles', 'module' => 'roles', 'description' => 'Can create new roles'],
            ['name' => 'edit-roles', 'display_name' => 'Edit Roles', 'module' => 'roles', 'description' => 'Can edit role permissions'],
            ['name' => 'delete-roles', 'display_name' => 'Delete Roles', 'module' => 'roles', 'description' => 'Can delete roles'],

            // Patient Management
            ['name' => 'view-patients', 'display_name' => 'View Patients', 'module' => 'patients', 'description' => 'Can view patients list'],
            ['name' => 'create-patients', 'display_name' => 'Create Patients', 'module' => 'patients', 'description' => 'Can create new patients'],
            ['name' => 'edit-patients', 'display_name' => 'Edit Patients', 'module' => 'patients', 'description' => 'Can edit patient information'],
            ['name' => 'delete-patients', 'display_name' => 'Delete Patients', 'module' => 'patients', 'description' => 'Can delete patients'],
            ['name' => 'view-patient-records', 'display_name' => 'View Patient Records', 'module' => 'patients', 'description' => 'Can view patient medical records'],
            ['name' => 'create-patient-records', 'display_name' => 'Create Patient Records', 'module' => 'patients', 'description' => 'Can create patient medical records'],

            // Doctor Management
            ['name' => 'view-doctors', 'display_name' => 'View Doctors', 'module' => 'doctors', 'description' => 'Can view doctors list'],
            ['name' => 'create-doctors', 'display_name' => 'Create Doctors', 'module' => 'doctors', 'description' => 'Can create new doctors'],
            ['name' => 'edit-doctors', 'display_name' => 'Edit Doctors', 'module' => 'doctors', 'description' => 'Can edit doctor information'],
            ['name' => 'delete-doctors', 'display_name' => 'Delete Doctors', 'module' => 'doctors', 'description' => 'Can delete doctors'],
            ['name' => 'manage-doctor-schedule', 'display_name' => 'Manage Doctor Schedule', 'module' => 'doctors', 'description' => 'Can manage doctor schedules'],

            // Clinic Management
            ['name' => 'view-clinics', 'display_name' => 'View Clinics', 'module' => 'clinics', 'description' => 'Can view clinics'],
            ['name' => 'create-clinics', 'display_name' => 'Create Clinics', 'module' => 'clinics', 'description' => 'Can create new clinics'],
            ['name' => 'edit-clinics', 'display_name' => 'Edit Clinics', 'module' => 'clinics', 'description' => 'Can edit clinic information'],
            ['name' => 'delete-clinics', 'display_name' => 'Delete Clinics', 'module' => 'clinics', 'description' => 'Can delete clinics'],

            // Appointment Management
            ['name' => 'view-appointments', 'display_name' => 'View Appointments', 'module' => 'appointments', 'description' => 'Can view appointments'],
            ['name' => 'create-appointments', 'display_name' => 'Create Appointments', 'module' => 'appointments', 'description' => 'Can create new appointments'],
            ['name' => 'edit-appointments', 'display_name' => 'Edit Appointments', 'module' => 'appointments', 'description' => 'Can edit appointments'],
            ['name' => 'delete-appointments', 'display_name' => 'Delete Appointments', 'module' => 'appointments', 'description' => 'Can delete appointments'],
            ['name' => 'manage-appointment-status', 'display_name' => 'Manage Appointment Status', 'module' => 'appointments', 'description' => 'Can update appointment status'],

            // Medical Records Management
            ['name' => 'view-medical-records', 'display_name' => 'View Medical Records', 'module' => 'medical-records', 'description' => 'Can view medical records'],
            ['name' => 'create-medical-records', 'display_name' => 'Create Medical Records', 'module' => 'medical-records', 'description' => 'Can create medical records'],
            ['name' => 'edit-medical-records', 'display_name' => 'Edit Medical Records', 'module' => 'medical-records', 'description' => 'Can edit medical records'],
            ['name' => 'delete-medical-records', 'display_name' => 'Delete Medical Records', 'module' => 'medical-records', 'description' => 'Can delete medical records'],

            // Prescription Management
            ['name' => 'view-prescriptions', 'display_name' => 'View Prescriptions', 'module' => 'prescriptions', 'description' => 'Can view prescriptions'],
            ['name' => 'create-prescriptions', 'display_name' => 'Create Prescriptions', 'module' => 'prescriptions', 'description' => 'Can create prescriptions'],
            ['name' => 'edit-prescriptions', 'display_name' => 'Edit Prescriptions', 'module' => 'prescriptions', 'description' => 'Can edit prescriptions'],
            ['name' => 'delete-prescriptions', 'display_name' => 'Delete Prescriptions', 'module' => 'prescriptions', 'description' => 'Can delete prescriptions'],

            // Billing Management
            ['name' => 'view-bills', 'display_name' => 'View Bills', 'module' => 'billing', 'description' => 'Can view bills'],
            ['name' => 'create-bills', 'display_name' => 'Create Bills', 'module' => 'billing', 'description' => 'Can create bills'],
            ['name' => 'edit-bills', 'display_name' => 'Edit Bills', 'module' => 'billing', 'description' => 'Can edit bills'],
            ['name' => 'delete-bills', 'display_name' => 'Delete Bills', 'module' => 'billing', 'description' => 'Can delete bills'],
            ['name' => 'process-payments', 'display_name' => 'Process Payments', 'module' => 'billing', 'description' => 'Can process payments'],

            // Reports and Analytics
            ['name' => 'view-reports', 'display_name' => 'View Reports', 'module' => 'reports', 'description' => 'Can view reports'],
            ['name' => 'generate-reports', 'display_name' => 'Generate Reports', 'module' => 'reports', 'description' => 'Can generate reports'],
            ['name' => 'export-reports', 'display_name' => 'Export Reports', 'module' => 'reports', 'description' => 'Can export reports'],

            // Salary Management
            ['name' => 'view-salaries', 'display_name' => 'View Salaries', 'module' => 'salaries', 'description' => 'Can view salary records'],
            ['name' => 'create-salaries', 'display_name' => 'Create Salaries', 'module' => 'salaries', 'description' => 'Can create salary records'],
            ['name' => 'edit-salaries', 'display_name' => 'Edit Salaries', 'module' => 'salaries', 'description' => 'Can edit salary records'],
            ['name' => 'delete-salaries', 'display_name' => 'Delete Salaries', 'module' => 'salaries', 'description' => 'Can delete salary records'],
            ['name' => 'pay-salaries', 'display_name' => 'Pay Salaries', 'module' => 'salaries', 'description' => 'Can process salary payments'],
            ['name' => 'view-salary-reports', 'display_name' => 'View Salary Reports', 'module' => 'salaries', 'description' => 'Can view salary reports and analytics'],

            // Financial Management
            ['name' => 'view-financial-reports', 'display_name' => 'View Financial Reports', 'module' => 'financial', 'description' => 'Can view financial reports'],
            ['name' => 'manage-expenses', 'display_name' => 'Manage Expenses', 'module' => 'financial', 'description' => 'Can manage clinic expenses'],
            ['name' => 'view-revenue-analytics', 'display_name' => 'View Revenue Analytics', 'module' => 'financial', 'description' => 'Can view revenue and income analytics'],
            ['name' => 'manage-budgets', 'display_name' => 'Manage Budgets', 'module' => 'financial', 'description' => 'Can create and manage clinic budgets'],

            // System Administration
            ['name' => 'view-system-settings', 'display_name' => 'View System Settings', 'module' => 'system', 'description' => 'Can view system settings'],
            ['name' => 'edit-system-settings', 'display_name' => 'Edit System Settings', 'module' => 'system', 'description' => 'Can edit system settings'],
            ['name' => 'view-audit-logs', 'display_name' => 'View Audit Logs', 'module' => 'system', 'description' => 'Can view audit logs'],
            ['name' => 'manage-backups', 'display_name' => 'Manage Backups', 'module' => 'system', 'description' => 'Can manage system backups'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }

        // Assign permissions to roles
        $this->assignPermissionsToRoles();
    }

    /**
     * Assign permissions to roles
     */
    private function assignPermissionsToRoles(): void
    {
        // Admin gets all permissions
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $adminRole->givePermissions(Permission::all()->pluck('name')->toArray());
        }

        // Doctor permissions
        $doctorRole = Role::where('name', 'doctor')->first();
        if ($doctorRole) {
            $doctorPermissions = [
                'view-patients', 'view-patient-records', 'create-patient-records', 'edit-patient-records',
                'view-appointments', 'edit-appointments', 'manage-appointment-status',
                'view-medical-records', 'create-medical-records', 'edit-medical-records',
                'view-prescriptions', 'create-prescriptions', 'edit-prescriptions',
                'view-doctors', 'view-clinics'
            ];
            $doctorRole->givePermissions($doctorPermissions);
        }

        // Patient permissions
        $patientRole = Role::where('name', 'patient')->first();
        if ($patientRole) {
            $patientPermissions = [
                'view-patient-records', 'view-appointments', 'create-appointments',
                'view-prescriptions', 'view-bills'
            ];
            $patientRole->givePermissions($patientPermissions);
        }

        // Receptionist permissions
        $receptionistRole = Role::where('name', 'receptionist')->first();
        if ($receptionistRole) {
            $receptionistPermissions = [
                'view-patients', 'create-patients', 'edit-patients',
                'view-appointments', 'create-appointments', 'edit-appointments',
                'view-doctors', 'view-clinics', 'view-bills', 'create-bills',
                'view-salaries', 'view-salary-reports', 'view-financial-reports',
                'view-revenue-analytics'
            ];
            $receptionistRole->givePermissions($receptionistPermissions);
        }

        // Nurse permissions
        $nurseRole = Role::where('name', 'nurse')->first();
        if ($nurseRole) {
            $nursePermissions = [
                'view-patients', 'view-patient-records', 'create-patient-records',
                'view-appointments', 'edit-appointments', 'manage-appointment-status',
                'view-medical-records', 'create-medical-records', 'edit-medical-records',
                'view-prescriptions', 'view-doctors', 'view-clinics'
            ];
            $nurseRole->givePermissions($nursePermissions);
        }
    }
}
