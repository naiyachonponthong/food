<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasUuid;

    protected $fillable = [
        'restaurant_id', 'session_id', 'order_number', 'round_number',
        'status', 'note',
        'subtotal', 'discount', 'service_charge', 'vat_amount', 'total',
        'served_by_id',
        'confirmed_at', 'preparing_at', 'ready_at', 'served_at',
        'cancelled_at', 'cancel_reason',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'service_charge' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'preparing_at' => 'datetime',
        'ready_at' => 'datetime',
        'served_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function session()
    {
        return $this->belongsTo(TableSession::class, 'session_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
