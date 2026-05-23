<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasUuid;

    protected $fillable = [
        'order_id', 'menu_id', 'name', 'price', 'cost', 'quantity',
        'note', 'is_refill', 'is_addon', 'status', 'subtotal',
    ];

    protected $casts = [
        'is_refill' => 'boolean',
        'is_addon' => 'boolean',
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function options()
    {
        return $this->hasMany(OrderItemOption::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
