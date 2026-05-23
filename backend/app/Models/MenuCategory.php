<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class MenuCategory extends Model
{
    use HasUuid;

    protected $fillable = [
        'restaurant_id', 'name', 'name_en', 'icon', 'image', 'sort_order', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function menus()
    {
        return $this->hasMany(Menu::class, 'category_id');
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
