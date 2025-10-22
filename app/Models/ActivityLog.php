<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $table = 'activity_log';

    protected $fillable = [
        'log_name',
        'description',
        'subject_type',
        'subject_id',
        'causer_type',
        'causer_id',
        'properties',
        'event',
        'batch_uuid',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    /**
     * Get the user that performed this activity.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'causer_id');
    }

    /**
     * Get the subject of this activity.
     */
    public function subject()
    {
        return $this->morphTo();
    }

    /**
     * Get the causer of this activity.
     */
    public function causer()
    {
        return $this->morphTo();
    }

    /**
     * Scope to get activities for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('causer_type', User::class)
                    ->where('causer_id', $userId);
    }

    /**
     * Scope to get activities by log name.
     */
    public function scopeInLog($query, $logName)
    {
        return $query->where('log_name', $logName);
    }

    /**
     * Scope to get activities by event.
     */
    public function scopeCausedBy($query, $causer)
    {
        if ($causer instanceof Model) {
            return $query->where('causer_type', get_class($causer))
                        ->where('causer_id', $causer->id);
        }

        return $query;
    }
}
