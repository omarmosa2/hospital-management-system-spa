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
        $user->load('roles');

        // If user is admin, allow all access
        if ($user->roles()->where('name', 'admin')->exists()) {
            return $next($request);
        }

        // If no specific roles required, just check if user has any role
        if (empty($roles)) {
            // Allow access if user has any role
            if ($user->roles()->exists()) {
                return $next($request);
            }
            // Redirect to dashboard with message if no roles
            return redirect()->route('dashboard')->with('message', 'Please wait for role assignment.');
        }

        // For specific role requirements
        $requiredRoles = array_map('trim', explode('|', $roles));
        
        // Check if user has any of the required roles
        if ($user->roles()->whereIn('name', $requiredRoles)->exists()) {
            return $next($request);
        }

        // User doesn't have required roles
        if ($request->wantsJson()) {
            return response()->json(['error' => 'Insufficient permissions'], 403);
        }

        return back()->with('error', 'You do not have permission to access this area.');
    }

    /**
     * Handle unauthorized access attempt
     */
    private function unauthorized(Request $request, string $message): Response
    {
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => $message,
                'status' => 'error'
            ], 403);
        }

        return redirect()->route('dashboard')->with('error', $message);
    }
}
