<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KitchenController extends Controller
{
    public function queue(Request $request): JsonResponse
    {
        $orders = Order::where('restaurant_id', $request->user()->restaurant_id)
            ->whereNotIn('status', ['served', 'cancelled'])
            ->with('items.options', 'session.table')
            ->orderBy('created_at')
            ->get();
        return response()->json(['orders' => $orders]);
    }

    public function updateItem(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:pending,confirmed,preparing,ready,served,cancelled'],
        ]);
        $item = OrderItem::with('order')->findOrFail($id);
        if ($item->order->restaurant_id !== $request->user()->restaurant_id) {
            abort(404);
        }
        $item->update(['status' => $request->status]);

        // Bubble: if all items in order are served, mark order served
        $order = $item->order->fresh('items');
        $statuses = $order->items->pluck('status')->unique();
        if ($statuses->count() === 1 && $statuses->first() === 'served') {
            $order->update(['status' => 'served', 'served_at' => now()]);
        } elseif ($statuses->contains('preparing')) {
            $order->update(['status' => 'preparing']);
        } elseif ($statuses->contains('ready') && !$statuses->contains('preparing') && !$statuses->contains('pending')) {
            $order->update(['status' => 'ready']);
        }

        return response()->json(['item' => $item->fresh()]);
    }
}
