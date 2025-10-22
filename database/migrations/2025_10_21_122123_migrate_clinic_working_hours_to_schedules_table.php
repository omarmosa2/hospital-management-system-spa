<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Migrate existing clinic working hours to the new clinic_schedules table
        $clinics = DB::table('clinics')->get();

        foreach ($clinics as $clinic) {
            if ($clinic->working_days && $clinic->start_time && $clinic->end_time) {
                $workingDays = json_decode($clinic->working_days, true);

                foreach ($workingDays as $day) {
                    DB::table('clinic_schedules')->insert([
                        'clinic_id' => $clinic->id,
                        'day_of_week' => $day,
                        'open_time' => $clinic->start_time,
                        'close_time' => $clinic->end_time,
                        'is_closed' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove all migrated schedules
        DB::table('clinic_schedules')->delete();
    }
};
