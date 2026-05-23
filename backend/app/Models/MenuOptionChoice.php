<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class MenuOptionChoice extends Model
{
    use HasUuid;
    public $timestamps = false;

    protected $fillable = ['option_id', 'name', 'price_addon', 'is_default'];

    protected $casts = ['is_default' => 'boolean', 'price_addon' => 'decimal:2'];

    public function option()
    {
        return $this->belongsTo(MenuOption::class, 'option_id');
    }
}
