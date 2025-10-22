<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class RoleSwitchController extends Controller
{
    public function switchRole(Request $request)
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = Auth::user();

        // Only admins can switch roles
        if (!$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized to switch roles'
            ], 403);
        }

        $role = Role::findOrFail($request->role_id);

        // Store current primary role in session for later restoration
        if (!Session::has('original_role_id')) {
            $currentRole = $user->roles()->first();
            if ($currentRole) {
                Session::put('original_role_id', $currentRole->id);
            }
        }

        // Temporarily change user's primary role (this is for testing only)
        // In a real scenario, you might want to modify the roles relationship
        Session::put('switched_role_id', $role->id);

        // Log the role switch
        activity()
            ->performedOn($user)
            ->causedBy($user)
            ->event('role_switched')
            ->log("Admin {$user->name} switched to role: {$role->display_name}");

        return response()->json([
            'message' => 'Role switched successfully',
            'role' => $role->display_name
        ]);
    }

    public function restoreRole(Request $request)
    {
        $user = Auth::user();

        if (Session::has('original_role_id')) {
            $originalRoleId = Session::get('original_role_id');
            Session::forget(['switched_role_id', 'original_role_id']);

            $originalRole = Role::find($originalRoleId);

            // Log the role restoration
            activity()
                ->performedOn($user)
                ->causedBy($user)
                ->event('role_restored')
                ->log("Admin {$user->name} restored to role: " . ($originalRole ? $originalRole->display_name : 'Original'));

            return response()->json([
                'message' => 'Role restored successfully'
            ]);
        }

        return response()->json([
            'message' => 'No role to restore'
        ], 400);
    }

    public function getAvailableRoles()
    {
        $user = Auth::user();

        if (!$user->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $roles = Role::all()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name,
            ];
        });

        return response()->json([
            'roles' => $roles,
            'current_switched_role' => Session::get('switched_role_id')
        ]);
    }
}
