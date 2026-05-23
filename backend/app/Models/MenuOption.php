<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class MenuOption extends Model
{
    use HasUuid;
    public $timestamps = false;

    protected $fillable = ['menu_id', 'name', 'is_required', 'max_select', 'sort_order'];

    protected $casts = ['is_required' => 'boolean'];

    public function choices()
    {
        return $this->hasMany(MenuOptionChoice::class, 'option_id');
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }
}
