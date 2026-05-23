<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class OrderItemOption extends Model
{
    use HasUuid;
    public $timestamps = false;

    protected $fillable = ['order_item_id', 'choice_id', 'name', 'price_addon'];

    protected $casts = ['price_addon' => 'decimal:2'];
}
