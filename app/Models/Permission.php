<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'module',
    ];

    /**
     * Get the roles that have this permission.
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions');
    }

    /**
     * Check if permission belongs to a specific module.
     */
    public function isForModule(string $module)
    {
        return $this->module === $module;
    }

    /**
     * Find permission by name.
     */
    public static function findByName(string $name)
    {
        return static::where('name', $name)->first();
    }

    /**
     * Get permissions by module.
     */
    public static function byModule(string $module)
    {
        return static::where('module', $module)->get();
    }
}
