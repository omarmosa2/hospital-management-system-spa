<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;

class CheckRoles extends Command
{
    protected $signature = 'check:roles';
    protected $description = 'Check roles and user assignments';

    public function handle()
    {
        $this->info('Checking roles...');
        $roles = Role::all();
        foreach ($roles as $role) {
            $this->info("Role: {$role->name} ({$role->id})");
            $users = User::whereHas('roles', function($q) use ($role) {
                $q->where('roles.id', $role->id);
            })->get();
            
            foreach ($users as $user) {
                $this->info("  - User: {$user->email}");
            }
        }
        
        $this->info("\nChecking users without roles...");
        $usersWithoutRoles = User::whereDoesntHave('roles')->get();
        foreach ($usersWithoutRoles as $user) {
            $this->info("- {$user->email} has no roles");
        }
    }
}