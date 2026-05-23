<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasUuid;

    protected $fillable = ['restaurant_id', 'type', 'title', 'body', 'data', 'is_read'];

    protected $casts = ['is_read' => 'boolean', 'data' => 'array'];
}
