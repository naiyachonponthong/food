<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class RestaurantSetting extends Model
{
    use HasUuid;

    protected $fillable = [
        'restaurant_id',
        'mode',
        'auto_confirm_order',
        'kitchen_print_auto',
        'slip_verify_enabled',
        'promptpay_number',
        'service_charge',
        'theme_color',
        'featured_menu_ids',
        'allow_call_staff',
        'call_staff_options',
        'allow_self_checkout',
    ];

    protected $casts = [
        'auto_confirm_order' => 'boolean',
        'kitchen_print_auto' => 'boolean',
        'slip_verify_enabled' => 'boolean',
        'allow_call_staff' => 'boolean',
        'allow_self_checkout' => 'boolean',
        'featured_menu_ids' => 'array',
        'call_staff_options' => 'array',
        'service_charge' => 'decimal:2',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
