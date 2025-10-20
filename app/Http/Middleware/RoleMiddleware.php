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
     * @param  string  $role
     */
    public function handle(Request $request, Closure $next, string $role = null): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // If no specific role is required, just check authentication
        if (!$role) {
            return $next($request);
        }

        // Check if user has a role assigned
        if (!$user->role) {
            // For now, allow access but show warning
            // In production, you might want to redirect to role assignment
            return $next($request);
        }

        // Check if user has the required role or is admin (admin has access to everything)
        $userRole = $user->role->name ?? null;
        $isAdmin = $userRole === 'admin';
        $hasRequiredRole = $userRole === $role;

        if ($isAdmin || $hasRequiredRole) {
            return $next($request);
        }

        // User doesn't have required role, redirect with error
        return redirect()->route('dashboard')->withErrors([
            'access' => 'You do not have permission to access this area.'
        ]);
    }
}
