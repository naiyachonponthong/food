<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class PackageItem extends Model
{
    use HasUuid;
    public $timestamps = false;

    protected $fillable = ['package_id', 'menu_id'];

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }
}
