<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $roles  Comma-separated list of roles
     */
    public function handle(Request $request, Closure $next, string $roles = null): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();
        
        // Check if user has any roles at all
        if ($user->roles->isEmpty()) {
            return response()->view('role-required', [
                'email' => $user->email,
                'status' => 'Active (awaiting role assignment)'
            ]);
        }
        
        // If no specific roles are required, just check if user has any role
        if (!$roles) {
            return $next($request);
        }

        // Convert roles string to array
        $requiredRoles = array_map('trim', explode('|', $roles));
        
        // Check if user has any of the required roles
        if ($user->roles()->whereIn('name', $requiredRoles)->exists()) {
            return $next($request);
        }

        // User doesn't have the required role
        return response()->view('role-required', [
            'email' => $user->email,
            'status' => 'Active (insufficient permissions)'
        ]);
    }
}

        // Check if user has a role assigned
        if (!$user->role) {
            return redirect()->route('dashboard')->withErrors([
                'access' => 'No role assigned to your account.'
            ]);
        }

        $userRole = $user->role->name;
        $requiredRoles = explode('|', $roles);

        // Admin has access to everything except where explicitly denied
        if ($userRole === 'admin') {
            return $next($request);
        }

        // Check if user's role is in the allowed roles list
        if (in_array($userRole, $requiredRoles)) {
            return $next($request);
        }

        // User doesn't have required role, redirect with error
        return redirect()->route('dashboard')->withErrors([
            'access' => 'You do not have permission to access this area.'
        ]);
    }
}
