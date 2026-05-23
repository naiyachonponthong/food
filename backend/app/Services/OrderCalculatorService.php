<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\TableSession;

class OrderCalculatorService
{
    /**
     * Calculate order totals from items and apply VAT + service charge from
     * restaurant settings. Returns the updated Order.
     */
    public function recalculateOrder(Order $order): Order
    {
        $order->load('items', 'session.table');
        $restaurant = $order->session->table->restaurant ?? null;
        $settings = $restaurant?->settings;
        $serviceRate = (float) ($settings->service_charge ?? 0);
        $hasVat = (bool) ($restaurant?->has_vat ?? false);
        $vatRate = (float) ($restaurant?->vat_rate ?? 7);

        $subtotal = 0.0;
        foreach ($order->items as $it) {
            if ($it->is_refill) {
                continue; // free refill
            }
            $optionAddons = (float) $it->options()->sum('price_addon');
            $line = ((float) $it->price + $optionAddons) * (int) $it->quantity;
            $it->subtotal = $line;
            $it->save();
            $subtotal += $line;
        }

        $serviceCharge = round($subtotal * $serviceRate / 100, 2);
        $vat = $hasVat ? round(($subtotal + $serviceCharge) * $vatRate / 100, 2) : 0;
        $total = $subtotal + $serviceCharge + $vat - (float) $order->discount;

        $order->subtotal = $subtotal;
        $order->service_charge = $serviceCharge;
        $order->vat_amount = $vat;
        $order->total = $total;
        $order->save();
        return $order->fresh('items');
    }

    /**
     * Calculate bill for a session — handles Normal & Buffet modes.
     */
    public function calculateBill(TableSession $session): array
    {
        $session->load('table.restaurant.settings', 'package', 'orders.items');
        $restaurant = $session->table->restaurant;
        $settings = $restaurant->settings;
        $serviceRate = (float) ($settings->service_charge ?? 0);
        $hasVat = (bool) $restaurant->has_vat;
        $vatRate = (float) $restaurant->vat_rate;

        $packageCharge = 0;
        $addonCharge = 0;
        $extensionCharge = 0;
        $orderSubtotal = 0;

        $isBuffet = $session->package_id !== null;

        if ($isBuffet) {
            $pkg = $session->package;
            $packageCharge =
                (int) $session->guest_adult * (float) ($pkg->price_adult ?? 0)
                + (int) $session->guest_child * (float) ($pkg->price_child ?? 0);

            $extensionCharge = (int) $session->extension_count * (float) ($pkg->extension_price ?? 0);

            // Sum items: only is_addon counted; refill/package items free
            foreach ($session->orders as $order) {
                foreach ($order->items as $it) {
                    if ($it->is_addon) {
                        $addonCharge += (float) $it->subtotal;
                    }
                }
            }
        } else {
            foreach ($session->orders as $order) {
                $orderSubtotal += (float) $order->subtotal;
            }
        }

        $subtotal = $isBuffet
            ? ($packageCharge + $addonCharge + $extensionCharge)
            : $orderSubtotal;

        $serviceCharge = round($subtotal * $serviceRate / 100, 2);
        $vat = $hasVat ? round(($subtotal + $serviceCharge) * $vatRate / 100, 2) : 0;
        $total = round($subtotal + $serviceCharge + $vat, 2);
        $subtotal = round($subtotal, 2);
        $packageCharge = round($packageCharge, 2);
        $addonCharge = round($addonCharge, 2);
        $extensionCharge = round($extensionCharge, 2);

        return compact(
            'subtotal',
            'packageCharge',
            'addonCharge',
            'extensionCharge',
            'serviceCharge',
            'vat',
            'total',
            'isBuffet',
        );
    }
}
