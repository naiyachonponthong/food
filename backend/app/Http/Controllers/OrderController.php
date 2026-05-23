<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemOption;
use App\Models\TableSession;
use App\Services\OrderCalculatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Order::where('restaurant_id', $request->user()->restaurant_id)
            ->with('items.options', 'session.table')
            ->orderByDesc('created_at');
        if ($request->filled('status')) {
            $q->where('status', $request->status);
        }
        if ($request->filled('session_id')) {
            $q->where('session_id', $request->session_id);
        }
        return response()->json(['orders' => $q->paginate(50)]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $order = Order::where('restaurant_id', $request->user()->restaurant_id)
            ->with('items.options', 'session.table')
            ->findOrFail($id);
        return response()->json(['order' => $order]);
    }

    public function place(Request $request, OrderCalculatorService $calc): JsonResponse
    {
        $data = $request->validate([
            'session_id' => ['required', 'uuid', 'exists:table_sessions,id'],
            'note' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_id' => ['required', 'uuid', 'exists:menus,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.note' => ['nullable', 'string'],
            'items.*.options' => ['nullable', 'array'],
            'items.*.options.*.choice_id' => ['required', 'uuid', 'exists:menu_option_choices,id'],
        ]);

        $session = TableSession::with('package.items', 'package.addons')->findOrFail($data['session_id']);

        if ($session->last_order_at && now()->gt($session->last_order_at)) {
            return response()->json(['message' => 'Last order time has passed.'], 422);
        }

        $packageMenuIds = $session->package?->items->pluck('menu_id')->toArray() ?? [];
        $addonPriceMap = $session->package?->addons->keyBy('menu_id')->map(fn ($a) => $a->price) ?? collect();

        $round = (int) Order::where('session_id', $session->id)->max('round_number') + 1;
        $orderNumber = 'ORD-' . str_pad((string) (Order::where('restaurant_id', $session->restaurant_id)->count() + 1), 4, '0', STR_PAD_LEFT);

        $order = DB::transaction(function () use ($data, $session, $round, $orderNumber, $packageMenuIds, $addonPriceMap) {
            $order = Order::create([
                'restaurant_id' => $session->restaurant_id,
                'session_id' => $session->id,
                'order_number' => $orderNumber,
                'round_number' => $round,
                'status' => 'pending',
                'note' => $data['note'] ?? null,
                'subtotal' => 0,
                'total' => 0,
            ]);

            foreach ($data['items'] as $row) {
                $menu = Menu::findOrFail($row['menu_id']);
                $isPackage = in_array($menu->id, $packageMenuIds, true);
                $isAddon = $addonPriceMap->has($menu->id);
                $unitPrice = $isPackage && !$isAddon
                    ? 0
                    : (float) ($isAddon ? $addonPriceMap[$menu->id] : $menu->price);

                $item = OrderItem::create([
                    'order_id' => $order->id,
                    'menu_id' => $menu->id,
                    'name' => $menu->name,
                    'price' => $unitPrice,
                    'cost' => $menu->cost,
                    'quantity' => (int) $row['quantity'],
                    'note' => $row['note'] ?? null,
                    'is_refill' => $isPackage && !$isAddon,
                    'is_addon' => $isAddon,
                    'status' => 'pending',
                    'subtotal' => $unitPrice * (int) $row['quantity'],
                ]);

                foreach ($row['options'] ?? [] as $opt) {
                    $choice = \App\Models\MenuOptionChoice::findOrFail($opt['choice_id']);
                    OrderItemOption::create([
                        'order_item_id' => $item->id,
                        'choice_id' => $choice->id,
                        'name' => $choice->name,
                        'price_addon' => $choice->price_addon,
                    ]);
                }
            }

            return $order;
        });

        $order = $calc->recalculateOrder($order);
        return response()->json(['order' => $order->load('items.options')], 201);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:pending,confirmed,preparing,ready,served,cancelled'],
        ]);
        $order = Order::where('restaurant_id', $request->user()->restaurant_id)->findOrFail($id);
        $update = ['status' => $request->status];
        $update[$request->status . '_at'] = now();
        $order->update($update);
        $order->items()->update(['status' => $request->status]);
        return response()->json(['order' => $order->fresh('items')]);
    }

    public function cancel(Request $request, string $id): JsonResponse
    {
        $request->validate(['reason' => ['required', 'string']]);
        $order = Order::where('restaurant_id', $request->user()->restaurant_id)->findOrFail($id);
        $order->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancel_reason' => $request->reason,
        ]);
        $order->items()->update(['status' => 'cancelled']);
        return response()->json(['order' => $order->fresh()]);
    }

    public function forSession(string $sessionId): JsonResponse
    {
        $orders = Order::where('session_id', $sessionId)
            ->with('items.options')
            ->orderBy('round_number')
            ->get();
        return response()->json(['orders' => $orders]);
    }
}
