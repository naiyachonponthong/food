<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReceiptController extends Controller
{
    /**
     * Render a printable receipt page for a Payment. Designed for 80mm
     * thermal printers — narrow column, mono font, no images, system
     * print dialog triggers automatically.
     */
    public function show(Request $request, string $id): Response
    {
        $payment = Payment::with([
            'session.table.restaurant.settings',
            'session.orders.items.options',
            'session.package',
        ])->findOrFail($id);

        $restaurant = $payment->session?->table?->restaurant;
        $settings = $restaurant?->settings;

        $items = collect();
        foreach ($payment->session?->orders ?? [] as $order) {
            foreach ($order->items as $it) {
                $items->push([
                    'name' => $it->name,
                    'qty' => $it->quantity,
                    'price' => (float) $it->price,
                    'subtotal' => (float) $it->subtotal,
                    'is_refill' => $it->is_refill,
                    'options' => $it->options->map(fn ($o) => $o->name)->toArray(),
                    'note' => $it->note,
                    'round' => $order->round_number,
                ]);
            }
        }

        $isBuffet = $payment->session?->package_id !== null;

        $methodLabel = match ($payment->method) {
            'cash' => 'เงินสด',
            'qr_promptpay' => 'QR PromptPay',
            'credit_card' => 'บัตรเครดิต',
            'bank_transfer' => 'โอนผ่านธนาคาร',
            default => $payment->method,
        };

        $html = view('receipts.show', [
            'payment' => $payment,
            'restaurant' => $restaurant,
            'settings' => $settings,
            'items' => $items,
            'isBuffet' => $isBuffet,
            'session' => $payment->session,
            'package' => $payment->session?->package,
            'methodLabel' => $methodLabel,
            'autoprint' => $request->boolean('print', true),
        ])->render();

        return response($html)->header('Content-Type', 'text/html; charset=utf-8');
    }
}
