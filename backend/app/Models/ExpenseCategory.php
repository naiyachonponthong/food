<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class ExpenseCategory extends Model
{
    use HasUuid;

    protected $fillable = ['restaurant_id', 'name', 'icon', 'sort_order'];
}
