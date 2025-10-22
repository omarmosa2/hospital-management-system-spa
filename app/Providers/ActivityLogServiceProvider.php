<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;

class ActivityLogServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Register the activity() helper function
        if (!function_exists('activity')) {
            function activity(string $logName = null)
            {
                $activity = app(\App\Services\ActivityLogger::class);

                if ($logName) {
                    return $activity->inLog($logName);
                }

                return $activity;
            }
        }
    }
}
