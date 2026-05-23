<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $restaurant = $request->user()->restaurant->load('settings');
        return response()->json(['restaurant' => $restaurant]);
    }

    public function update(Request $request): JsonResponse
    {
        $restaurant = $request->user()->restaurant;
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'tax_id' => ['sometimes', 'nullable', 'string', 'max:20'],
            'has_vat' => ['sometimes', 'boolean'],
            'vat_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
        ]);
        $restaurant->update($data);
        return response()->json(['restaurant' => $restaurant->fresh('settings')]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $restaurant = $request->user()->restaurant;
        $data = $request->validate([
            'mode' => ['sometimes', 'in:normal,buffet'],
            'auto_confirm_order' => ['sometimes', 'boolean'],
            'kitchen_print_auto' => ['sometimes', 'boolean'],
            'slip_verify_enabled' => ['sometimes', 'boolean'],
            'promptpay_number' => ['sometimes', 'nullable', 'string', 'max:20'],
            'service_charge' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'theme_color' => ['sometimes', 'string', 'max:7'],
            'featured_menu_ids' => ['sometimes', 'array'],
            'allow_call_staff' => ['sometimes', 'boolean'],
            'call_staff_options' => ['sometimes', 'array'],
            'allow_self_checkout' => ['sometimes', 'boolean'],
        ]);
        $restaurant->settings()->updateOrCreate(['restaurant_id' => $restaurant->id], $data);
        return response()->json(['settings' => $restaurant->settings()->first()]);
    }
}
