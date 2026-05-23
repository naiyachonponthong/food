<?php

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasUuid;

    protected $fillable = [
        'restaurant_id', 'category_id', 'amount', 'note',
        'expense_date', 'created_by_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
    ];

    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }
}
