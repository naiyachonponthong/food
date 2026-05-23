<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function categories(Request $request): JsonResponse
    {
        $cats = ExpenseCategory::where('restaurant_id', $request->user()->restaurant_id)
            ->orderBy('sort_order')->get();
        return response()->json(['categories' => $cats]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['nullable', 'integer'],
        ]);
        $data['restaurant_id'] = $request->user()->restaurant_id;
        return response()->json(['category' => ExpenseCategory::create($data)], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $q = Expense::where('restaurant_id', $request->user()->restaurant_id)
            ->with('category')
            ->orderByDesc('expense_date');
        if ($request->filled('from')) {
            $q->where('expense_date', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $q->where('expense_date', '<=', $request->to);
        }
        if ($request->filled('category_id')) {
            $q->where('category_id', $request->category_id);
        }
        return response()->json(['expenses' => $q->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id' => ['required', 'uuid', 'exists:expense_categories,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'note' => ['nullable', 'string'],
            'expense_date' => ['required', 'date'],
        ]);
        $data['restaurant_id'] = $request->user()->restaurant_id;
        $data['created_by_id'] = $request->user()->id;
        return response()->json(['expense' => Expense::create($data)], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $exp = Expense::where('restaurant_id', $request->user()->restaurant_id)->findOrFail($id);
        $exp->update($request->only(['category_id', 'amount', 'note', 'expense_date']));
        return response()->json(['expense' => $exp]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $exp = Expense::where('restaurant_id', $request->user()->restaurant_id)->findOrFail($id);
        $exp->delete();
        return response()->json(['ok' => true]);
    }

    public function summary(Request $request): JsonResponse
    {
        $month = $request->month ?? now()->format('Y-m');
        $rows = Expense::where('restaurant_id', $request->user()->restaurant_id)
            ->where('expense_date', 'like', "$month%")
            ->with('category')
            ->get()
            ->groupBy(fn ($e) => $e->category?->name ?? 'Uncategorized')
            ->map(fn ($g) => ['count' => $g->count(), 'total' => $g->sum('amount')]);
        return response()->json([
            'month' => $month,
            'total' => Expense::where('restaurant_id', $request->user()->restaurant_id)
                ->where('expense_date', 'like', "$month%")->sum('amount'),
            'by_category' => $rows,
        ]);
    }
}
