<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'two_factor_recovery_codes' => 'array',
        ];
    }

    /**
     * Get all roles for this user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withTimestamps()
            ->withPivot('assigned_at');
    }

    /**
     * Get the primary role of this user.
     */
    public function primaryRole()
    {
        return $this->roles->first();
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->roles->contains('name', $role);
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(string $roles): bool
    {
        $roleArray = array_map('trim', explode('|', $roles));
        return $this->roles->pluck('name')->intersect($roleArray)->isNotEmpty();
    }

    /**
     * Check if user has all of the given roles.
     */
    public function hasAllRoles(array $roles): bool
    {
        return $this->roles->pluck('name')->intersect($roles)->count() === count($roles);
    }

    /**
     * Check if user is an admin.
     */
    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user is a doctor.
     */
    public function isDoctor()
    {
        return $this->hasRole('doctor');
    }

    /**
     * Check if user is a nurse.
     */
    public function isNurse()
    {
        return $this->hasRole('nurse');
    }

    /**
     * Check if user is a patient.
     */
    public function isPatient()
    {
        return $this->hasRole('patient');
    }

    /**
     * Check if user is a receptionist.
     */
    public function isReceptionist()
    {
        return $this->hasRole('receptionist');
    }

    /**
     * Get user's display role name.
     */
    public function getRoleDisplayName()
    {
        $role = $this->primaryRole();
        return $role ? $role->display_name : 'No Role Assigned';
    }

    /**
     * Assign a role to the user.
     */
    public function assignRole($role)
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }
        
        if (!$this->roles()->where('roles.id', $role->id)->exists()) {
            $this->roles()->attach($role->id, ['assigned_at' => now()]);
        }
    }

    /**
     * Assign multiple roles to the user.
     */
    public function assignRoles(array $roles)
    {
        $this->roles()->sync($roles);
    }

    // Relationships for different user types
    public function doctor()
    {
        return $this->hasOne(\App\Models\Doctor::class);
    }

    public function patient()
    {
        return $this->hasOne(\App\Models\Patient::class);
    }

    /**
     * Get the two factor authentication recovery codes for the user.
     */
    public function twoFactorRecoveryCodes()
    {
        return $this->two_factor_recovery_codes;
    }

    /**
     * Set the two factor authentication recovery codes for the user.
     */
    public function setTwoFactorRecoveryCodes($codes)
    {
        $this->two_factor_recovery_codes = $codes;
        $this->save();
    }

    /**
     * Check if user has a specific permission through their roles.
     */
    public function hasPermission(string $permission)
    {
        if (!$this->role) {
            return false;
        }

        return $this->role->hasPermission($permission);
    }

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission(array $permissions)
    {
        if (!$this->role) {
            return false;
        }

        return $this->role->hasAnyPermission($permissions);
    }

    /**
     * Check if user has all of the given permissions.
     */
    public function hasAllPermissions(array $permissions)
    {
        if (!$this->role) {
            return false;
        }

        return $this->role->hasAllPermissions($permissions);
    }

    /**
     * Check if user can perform an action (alias for hasPermission).
     */
    public function canPerform(string $permission)
    {
        return $this->hasPermission($permission);
    }

    /**
     * Check if user cannot perform an action (opposite of canPerform).
     */
    public function cannotPerform(string $permission)
    {
        return !$this->canPerform($permission);
    }
}
