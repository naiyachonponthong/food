<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasUuid;

    protected $fillable = [
        'restaurant_id', 'category_id', 'name', 'name_en', 'description', 'image',
        'price', 'cost', 'calories', 'is_available', 'is_featured',
        'is_package_item', 'is_addon', 'sort_order', 'tags',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'is_featured' => 'boolean',
        'is_package_item' => 'boolean',
        'is_addon' => 'boolean',
        'tags' => 'array',
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(MenuCategory::class, 'category_id');
    }

    public function options()
    {
        return $this->hasMany(MenuOption::class);
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
