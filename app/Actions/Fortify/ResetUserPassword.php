<?php

namespace App\Actions\Fortify;

use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\ResetsUserPasswords;

class ResetUserPassword implements ResetsUserPasswords
{
    use PasswordValidationRules;

    /**
     * Reset the user's password.
     *
     * @param  mixed  $user
     * @param  array<string, string>  $input
     */
    public function reset($user, array $input): void
    {
        $user->forceFill([
            'password' => Hash::make($input['password']),
            'remember_token' => Str::random(60),
        ])->save();

        event(new PasswordReset($user));
    }
}