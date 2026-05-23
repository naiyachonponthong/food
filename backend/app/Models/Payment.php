<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasUuid;

    protected $fillable = [
        'restaurant_id', 'session_id', 'receipt_number',
        'method', 'status',
        'subtotal', 'package_charge', 'addon_charge', 'extension_charge',
        'discount', 'service_charge', 'vat_amount', 'total',
        'amount_paid', 'change_amount',
        'slip_url', 'slip_verified', 'verified_at', 'paid_at', 'note',
    ];

    protected $casts = [
        'slip_verified' => 'boolean',
        'verified_at' => 'datetime',
        'paid_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'package_charge' => 'decimal:2',
        'addon_charge' => 'decimal:2',
        'extension_charge' => 'decimal:2',
        'discount' => 'decimal:2',
        'service_charge' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'change_amount' => 'decimal:2',
    ];

    public function session()
    {
        return $this->belongsTo(TableSession::class, 'session_id');
    }
}
