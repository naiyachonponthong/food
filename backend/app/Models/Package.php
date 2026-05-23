<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasUuid;

    protected $fillable = [
        'restaurant_id', 'name', 'description',
        'price_adult', 'price_child', 'price_child_min_age', 'price_child_max_age',
        'duration_minutes', 'last_order_before',
        'extension_price', 'extension_minutes',
        'is_active', 'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price_adult' => 'decimal:2',
        'price_child' => 'decimal:2',
        'extension_price' => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(PackageItem::class);
    }

    public function addons()
    {
        return $this->hasMany(PackageAddon::class);
    }
}
