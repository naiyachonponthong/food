<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class TableSession extends Model
{
    use HasUuid;

    protected $fillable = [
        'restaurant_id', 'table_id', 'token', 'status', 'guest_count',
        'package_id', 'guest_adult', 'guest_child',
        'started_at', 'expires_at', 'last_order_at',
        'is_extended', 'extension_count',
        'opened_at', 'closed_at',
    ];

    protected $casts = [
        'is_extended' => 'boolean',
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
        'last_order_at' => 'datetime',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($s) {
            if (empty($s->token)) {
                $s->token = (string) Str::uuid();
            }
        });
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'session_id');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class, 'session_id');
    }
}
