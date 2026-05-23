<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class PackageAddon extends Model
{
    use HasUuid;
    public $timestamps = false;

    protected $fillable = ['package_id', 'menu_id', 'price'];

    protected $casts = ['price' => 'decimal:2'];

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }
}
