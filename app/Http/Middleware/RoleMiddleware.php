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
     * @param  string  $roles  Pipe-separated list of roles (e.g. 'admin|doctor')
     */
    public function handle(Request $request, Closure $next, string $roles = null): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();
        
        // Admin always has access
        if ($user->roles()->where('name', 'admin')->exists()) {
            return $next($request);
        }

        // If no roles specified, allow access if user has any role
        if (empty($roles)) {
            if ($user->roles()->exists()) {
                return $next($request);
            }
            return redirect()->route('dashboard')->with('error', 'Role assignment required.');
        }

        // Check for specific role requirements
        $requiredRoles = array_map('trim', explode('|', $roles));
        
        // Check if user has any of the required roles using a single query
        $hasRole = $user->roles()
            ->whereIn('name', $requiredRoles)
            ->exists();

        if ($hasRole) {
            return $next($request);
        }

        // If using API
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => 'Insufficient permissions',
                'required_roles' => $requiredRoles
            ], 403);
        }

        // For web requests
        return back()->with('error', 'You do not have permission to access this area.');
    }
}
