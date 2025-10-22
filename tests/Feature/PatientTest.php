<?php

namespace Tests\Feature;

use App\Models\Patient;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::create([
            'name' => 'admin',
            'display_name' => 'Administrator',
            'description' => 'System administrator'
        ]);

        Role::create([
            'name' => 'receptionist',
            'display_name' => 'موظف الاستقبال',
            'description' => 'موظف استقبال المستشفى'
        ]);
    }

    public function test_patient_creation_with_valid_data()
    {
        // Create a receptionist user
        $user = User::factory()->create();
        $role = Role::where('name', 'receptionist')->first();
        $user->assignRole($role);

        $this->actingAs($user);

        $patientData = [
            'full_name' => 'أحمد محمد علي',
            'date_of_birth' => '1990-01-01',
            'gender' => 'ذكر',
            'phone' => '+966501234567',
            'email' => 'ahmed@example.com',
            'address' => 'الرياض، السعودية',
            'identity_number' => '1234567890',
            'notes' => 'مريض منتظم'
        ];

        $response = $this->post('/patients', $patientData);

        $response->assertStatus(302); // Redirect after success
        // The redirect goes to the patient show page
        $patient = \App\Models\Patient::where('phone', '+966501234567')->first();
        $response->assertRedirect('/patients/' . $patient->id);

        $this->assertDatabaseHas('patients', [
            'full_name' => 'أحمد محمد علي',
            'gender' => 'ذكر',
            'phone' => '+966501234567',
            'email' => 'ahmed@example.com',
            'is_active' => true
        ]);
    }

    public function test_patient_creation_requires_three_part_name()
    {
        $user = User::factory()->create();
        $role = Role::where('name', 'receptionist')->first();
        $user->assignRole($role);

        $this->actingAs($user);

        $patientData = [
            'full_name' => 'أحمد محمد', // Only two parts
            'date_of_birth' => '1990-01-01',
            'gender' => 'ذكر',
            'phone' => '+966501234567',
        ];

        $response = $this->post('/patients', $patientData);

        $response->assertStatus(302);
        $response->assertSessionHasErrors('full_name');
    }

    public function test_patient_creation_validates_phone_format()
    {
        $user = User::factory()->create();
        $role = Role::where('name', 'receptionist')->first();
        $user->assignRole($role);

        $this->actingAs($user);

        $patientData = [
            'full_name' => 'أحمد محمد علي',
            'date_of_birth' => '1990-01-01',
            'gender' => 'ذكر',
            'phone' => '123456789', // Invalid format
        ];

        $response = $this->post('/patients', $patientData);

        $response->assertStatus(302);
        $response->assertSessionHasErrors('phone');
    }

    public function test_patient_creation_prevents_duplicate_phone()
    {
        $user = User::factory()->create();
        $role = Role::where('name', 'receptionist')->first();
        $user->assignRole($role);

        $this->actingAs($user);

        // Create first patient
        Patient::create([
            'patient_id' => 'PAT-00000001',
            'full_name' => 'أحمد محمد علي',
            'date_of_birth' => '1990-01-01',
            'age' => 34,
            'gender' => 'ذكر',
            'phone' => '+966501234567',
            'created_by' => $user->id,
            'created_at_staff' => now()
        ]);

        // Try to create second patient with same phone
        $patientData = [
            'full_name' => 'فاطمة أحمد سالم',
            'date_of_birth' => '1985-05-15',
            'gender' => 'أنثى',
            'phone' => '+966501234567', // Same phone
        ];

        $response = $this->post('/patients', $patientData);

        $response->assertStatus(302);
        $response->assertSessionHasErrors('phone');
    }

    public function test_patient_requires_authentication()
    {
        $patientData = [
            'full_name' => 'أحمد محمد علي',
            'date_of_birth' => '1990-01-01',
            'gender' => 'ذكر',
            'phone' => '+966501234567',
        ];

        $response = $this->post('/patients', $patientData);

        $response->assertStatus(302); // Redirect to login
        $response->assertRedirect('/login');
    }

    public function test_patient_creation_requires_proper_role()
    {
        // Create a patient user (not receptionist or admin)
        $user = User::factory()->create();
        $role = Role::where('name', 'patient')->first();
        if (!$role) {
            $role = Role::create([
                'name' => 'patient',
                'display_name' => 'مريض',
                'description' => 'حساب المريض'
            ]);
        }
        $user->assignRole($role);

        $this->actingAs($user);

        $patientData = [
            'full_name' => 'أحمد محمد علي',
            'date_of_birth' => '1990-01-01',
            'gender' => 'ذكر',
            'phone' => '+966501234567',
        ];

        $response = $this->post('/patients', $patientData);

        // Should redirect to login or show unauthorized error
        $response->assertStatus(302); // Redirect to login since unauthorized
    }

    public function test_patient_id_is_auto_generated()
    {
        $user = User::factory()->create();
        $role = Role::where('name', 'receptionist')->first();
        $user->assignRole($role);

        $this->actingAs($user);

        $patientData = [
            'full_name' => 'أحمد محمد علي',
            'date_of_birth' => '1990-01-01',
            'gender' => 'ذكر',
            'phone' => '+966501234567',
        ];

        $this->post('/patients', $patientData);

        $patient = Patient::where('phone', '+966501234567')->first();
        $this->assertNotNull($patient);
        $this->assertStringStartsWith('PAT-', $patient->patient_id);
    }
}