<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Restaurant extends Model
{
    use HasUuid;

    protected $fillable = [
        'name',
        'slug',
        'logo',
        'cover_image',
        'address',
        'phone',
        'tax_id',
        'has_vat',
        'vat_rate',
        'currency',
        'timezone',
    ];

    protected $casts = [
        'has_vat' => 'boolean',
        'vat_rate' => 'decimal:2',
    ];

    public function settings(): HasOne
    {
        return $this->hasOne(RestaurantSetting::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(MenuCategory::class);
    }

    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class);
    }

    public function packages(): HasMany
    {
        return $this->hasMany(Package::class);
    }

    public function tables(): HasMany
    {
        return $this->hasMany(Table::class);
    }

    public function expenseCategories(): HasMany
    {
        return $this->hasMany(ExpenseCategory::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }
}
