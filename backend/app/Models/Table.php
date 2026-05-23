<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    use HasUuid;

    protected $fillable = [
        'restaurant_id', 'number', 'name', 'capacity', 'zone',
        'qr_type', 'static_qr_code', 'status', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function activeSession()
    {
        return $this->hasOne(TableSession::class)->where('status', 'active');
    }

    public function sessions()
    {
        return $this->hasMany(TableSession::class);
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
