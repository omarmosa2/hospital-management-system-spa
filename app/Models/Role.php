<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'is_active',
    ];

    /**
     * Get the users that belong to this role.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles');
    }

    /**
     * Get the permissions that belong to this role.
     */
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permissions');
    }

    /**
     * Get the primary users for this role.
     */
    public function primaryUsers()
    {
        return $this->hasMany(User::class, 'role_id');
    }

    /**
     * Check if the role is an admin role.
     */
    public function isAdmin()
    {
        return $this->name === 'admin';
    }

    /**
     * Check if the role is a doctor role.
     */
    public function isDoctor()
    {
        return $this->name === 'doctor';
    }

    /**
     * Check if the role is a nurse role.
     */
    public function isNurse()
    {
        return $this->name === 'nurse';
    }

    /**
     * Check if the role is a patient role.
     */
    public function isPatient()
    {
        return $this->name === 'patient';
    }

    /**
     * Check if the role is a receptionist role.
     */
    public function isReceptionist()
    {
        return $this->name === 'receptionist';
    }

    /**
     * Get role by name.
     */
    public static function findByName(string $name)
    {
        return static::where('name', $name)->first();
    }

    /**
     * Get admin role.
     */
    public static function admin()
    {
        return static::findByName('admin');
    }

    /**
     * Get doctor role.
     */
    public static function doctor()
    {
        return static::findByName('doctor');
    }

    /**
     * Get nurse role.
     */
    public static function nurse()
    {
        return static::findByName('nurse');
    }

    /**
     * Get patient role.
     */
    public static function patient()
    {
        return static::findByName('patient');
    }

    /**
     * Get receptionist role.
     */
    public static function receptionist()
    {
        return static::findByName('receptionist');
    }

    /**
     * Check if role has a specific permission.
     */
    public function hasPermission(string $permission)
    {
        return $this->permissions()->where('name', $permission)->exists();
    }

    /**
     * Check if role has any of the given permissions.
     */
    public function hasAnyPermission(array $permissions)
    {
        return $this->permissions()->whereIn('name', $permissions)->exists();
    }

    /**
     * Check if role has all of the given permissions.
     */
    public function hasAllPermissions(array $permissions)
    {
        $count = $this->permissions()->whereIn('name', $permissions)->count();
        return $count === count($permissions);
    }

    /**
     * Give permission to role.
     */
    public function givePermission(Permission $permission)
    {
        if (!$this->hasPermission($permission->name)) {
            $this->permissions()->attach($permission->id);
        }
        return $this;
    }

    /**
     * Give multiple permissions to role.
     */
    public function givePermissions(array $permissions)
    {
        $permissionIds = [];
        foreach ($permissions as $permission) {
            if ($permission instanceof Permission) {
                $permissionIds[] = $permission->id;
            } elseif (is_string($permission)) {
                $perm = Permission::findByName($permission);
                if ($perm) {
                    $permissionIds[] = $perm->id;
                }
            }
        }

        $this->permissions()->attach($permissionIds);
        return $this;
    }

    /**
     * Revoke permission from role.
     */
    public function revokePermission(Permission $permission)
    {
        $this->permissions()->detach($permission->id);
        return $this;
    }

    /**
     * Revoke multiple permissions from role.
     */
    public function revokePermissions(array $permissions)
    {
        $permissionIds = [];
        foreach ($permissions as $permission) {
            if ($permission instanceof Permission) {
                $permissionIds[] = $permission->id;
            } elseif (is_string($permission)) {
                $perm = Permission::findByName($permission);
                if ($perm) {
                    $permissionIds[] = $perm->id;
                }
            }
        }

        $this->permissions()->detach($permissionIds);
        return $this;
    }

    /**
     * Check if role is active.
     */
    public function isActive()
    {
        return (bool) $this->is_active;
    }
}
