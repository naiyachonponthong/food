<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Notification;
use App\Models\TableSession;
use App\Services\OrderCalculatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    protected function session(string $token): TableSession
    {
        return TableSession::where('token', $token)
            ->where('status', 'active')
            ->with('table.restaurant.settings', 'package.items.menu', 'package.addons.menu')
            ->firstOrFail();
    }

    public function restaurant(string $token): JsonResponse
    {
        $session = $this->session($token);
        $r = $session->table->restaurant;
        return response()->json([
            'restaurant' => $r,
            'settings' => $r->settings,
            'table' => $session->table,
            'session' => $session,
        ]);
    }

    public function menus(string $token): JsonResponse
    {
        $session = $this->session($token);
        $menus = Menu::where('restaurant_id', $session->restaurant_id)
            ->where('is_available', true)
            ->with('category', 'options.choices')
            ->orderBy('sort_order')
            ->get();
        return response()->json(['menus' => $menus]);
    }

    public function package(string $token): JsonResponse
    {
        $session = $this->session($token);
        return response()->json([
            'package' => $session->package,
            'expires_at' => $session->expires_at,
            'last_order_at' => $session->last_order_at,
            'remaining_seconds' => $session->expires_at
                ? max(0, now()->diffInSeconds($session->expires_at, false))
                : null,
        ]);
    }

    public function placeOrder(Request $request, string $token, OrderCalculatorService $calc): JsonResponse
    {
        $session = $this->session($token);
        // Delegate to OrderController logic via simple inline create
        $request->merge(['session_id' => $session->id]);
        return app(\App\Http\Controllers\OrderController::class)->place($request, $calc);
    }

    public function myOrders(string $token): JsonResponse
    {
        $session = $this->session($token);
        $orders = \App\Models\Order::where('session_id', $session->id)
            ->with('items.options')
            ->orderBy('round_number')
            ->get();
        return response()->json(['orders' => $orders]);
    }

    public function callStaff(Request $request, string $token): JsonResponse
    {
        $session = $this->session($token);
        $reason = $request->validate(['reason' => ['required', 'string']])['reason'];
        Notification::create([
            'restaurant_id' => $session->restaurant_id,
            'type' => 'call_staff',
            'title' => 'เรียกพนักงาน',
            'body' => $reason,
            'data' => [
                'session_id' => $session->id,
                'table_id' => $session->table_id,
                'table_name' => $session->table->name,
            ],
        ]);
        return response()->json(['ok' => true]);
    }

    public function requestBill(string $token): JsonResponse
    {
        $session = $this->session($token);
        Notification::create([
            'restaurant_id' => $session->restaurant_id,
            'type' => 'bill_request',
            'title' => 'ขอเช็คบิล',
            'body' => 'โต๊ะ ' . $session->table->name,
            'data' => ['session_id' => $session->id, 'table_id' => $session->table_id],
        ]);
        return response()->json(['ok' => true]);
    }

    public function bill(string $token, OrderCalculatorService $calc): JsonResponse
    {
        $session = $this->session($token);
        return response()->json(['bill' => $calc->calculateBill($session)]);
    }
}
