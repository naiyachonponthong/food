<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $rid = $request->user()->restaurant_id;
        $today = today();

        $todayRevenue = (float) Payment::where('restaurant_id', $rid)
            ->where('status', 'paid')
            ->whereDate('paid_at', $today)
            ->sum('total');

        $todayOrders = Order::where('restaurant_id', $rid)
            ->whereDate('created_at', $today)
            ->count();

        $activeTables = Table::where('restaurant_id', $rid)
            ->where('status', 'occupied')
            ->count();

        $pendingOrders = Order::where('restaurant_id', $rid)
            ->whereIn('status', ['pending', 'confirmed', 'preparing'])
            ->count();

        return response()->json(compact(
            'todayRevenue',
            'todayOrders',
            'activeTables',
            'pendingOrders',
        ));
    }

    public function sales(Request $request): JsonResponse
    {
        $rid = $request->user()->restaurant_id;
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to = $request->get('to', now()->toDateString());

        $rows = Payment::where('restaurant_id', $rid)
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->selectRaw('date(paid_at) as date, sum(total) as revenue, count(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json(['from' => $from, 'to' => $to, 'rows' => $rows]);
    }

    public function topMenus(Request $request): JsonResponse
    {
        $rid = $request->user()->restaurant_id;
        $month = $request->get('month', now()->format('Y-m'));
        $items = OrderItem::query()
            ->whereHas('order', fn ($q) => $q->where('restaurant_id', $rid)
                ->where('created_at', 'like', "$month%"))
            ->selectRaw('menu_id, name, sum(quantity) as sold, sum(subtotal) as revenue')
            ->groupBy('menu_id', 'name')
            ->orderByDesc('sold')
            ->limit(10)
            ->get();
        return response()->json(['month' => $month, 'menus' => $items]);
    }

    public function pl(Request $request): JsonResponse
    {
        $rid = $request->user()->restaurant_id;
        $month = $request->get('month', now()->format('Y-m'));

        $revenue = (float) Payment::where('restaurant_id', $rid)
            ->where('status', 'paid')
            ->where('paid_at', 'like', "$month%")
            ->sum('total');

        $cogs = (float) OrderItem::query()
            ->whereHas('order', fn ($q) => $q->where('restaurant_id', $rid)
                ->where('created_at', 'like', "$month%"))
            ->selectRaw('sum(cost * quantity) as t')
            ->value('t');

        $expenses = (float) Expense::where('restaurant_id', $rid)
            ->where('expense_date', 'like', "$month%")
            ->sum('amount');

        $grossProfit = $revenue - $cogs;
        $netProfit = $grossProfit - $expenses;

        return response()->json([
            'month' => $month,
            'revenue' => $revenue,
            'cogs' => $cogs,
            'gross_profit' => $grossProfit,
            'gross_margin' => $revenue > 0 ? round($grossProfit / $revenue * 100, 2) : 0,
            'expenses' => $expenses,
            'net_profit' => $netProfit,
            'net_margin' => $revenue > 0 ? round($netProfit / $revenue * 100, 2) : 0,
        ]);
    }

    public function hourly(Request $request): JsonResponse
    {
        $rid = $request->user()->restaurant_id;
        $date = $request->get('date', today()->toDateString());
        $rows = Payment::where('restaurant_id', $rid)
            ->where('status', 'paid')
            ->whereDate('paid_at', $date)
            ->selectRaw("strftime('%H', paid_at) as hour, sum(total) as revenue, count(*) as orders")
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();
        return response()->json(['date' => $date, 'rows' => $rows]);
    }
}
