<?php

namespace App\Http\Controllers;

use App\Models\Table;
use App\Models\TableSession;
use App\Services\OrderCalculatorService;
use App\Services\QrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function open(Request $request, QrCodeService $qr): JsonResponse
    {
        $data = $request->validate([
            'table_id' => ['required', 'uuid', 'exists:tables,id'],
            'guest_count' => ['nullable', 'integer', 'min:1'],
            'guest_adult' => ['nullable', 'integer', 'min:0'],
            'guest_child' => ['nullable', 'integer', 'min:0'],
            'package_id' => ['nullable', 'uuid', 'exists:packages,id'],
            'qr_type' => ['nullable', 'in:static,dynamic'],
        ]);

        $table = Table::where('restaurant_id', $request->user()->restaurant_id)
            ->findOrFail($data['table_id']);

        if ($table->status === 'occupied') {
            return response()->json([
                'message' => 'Table is already occupied. Close the previous session first.',
            ], 422);
        }

        $session = TableSession::create([
            'restaurant_id' => $request->user()->restaurant_id,
            'table_id' => $table->id,
            'guest_count' => $data['guest_count'] ?? (($data['guest_adult'] ?? 0) + ($data['guest_child'] ?? 0) ?: 1),
            'guest_adult' => $data['guest_adult'] ?? 0,
            'guest_child' => $data['guest_child'] ?? 0,
            'package_id' => $data['package_id'] ?? null,
            'status' => 'active',
            'opened_at' => now(),
        ]);

        if (!empty($data['qr_type'])) {
            $table->update(['qr_type' => $data['qr_type']]);
        }
        $table->update(['status' => 'occupied']);

        $url = $qr->customerSessionUrl($session->token);
        return response()->json([
            'session' => $session->fresh('table', 'package'),
            'qr_url' => $url,
            'qr_image' => $qr->dataUri($url),
        ], 201);
    }

    public function byToken(string $token): JsonResponse
    {
        $session = TableSession::where('token', $token)
            ->with('table', 'package.items.menu', 'package.addons.menu')
            ->firstOrFail();
        return response()->json(['session' => $session]);
    }

    public function startTimer(Request $request, string $id): JsonResponse
    {
        $session = TableSession::findOrFail($id);
        if (!$session->package_id) {
            return response()->json(['message' => 'Not a buffet session.'], 422);
        }
        $pkg = $session->package;
        $now = now();
        $session->update([
            'started_at' => $now,
            'expires_at' => $now->copy()->addMinutes((int) $pkg->duration_minutes),
            'last_order_at' => $now->copy()->addMinutes((int) $pkg->duration_minutes - (int) $pkg->last_order_before),
        ]);
        return response()->json(['session' => $session->fresh()]);
    }

    public function extend(Request $request, string $id): JsonResponse
    {
        $session = TableSession::findOrFail($id);
        if (!$session->package_id) {
            return response()->json(['message' => 'Not a buffet session.'], 422);
        }
        $pkg = $session->package;
        $session->expires_at = $session->expires_at?->copy()->addMinutes((int) $pkg->extension_minutes)
            ?? now()->addMinutes((int) $pkg->extension_minutes);
        $session->is_extended = true;
        $session->extension_count++;
        $session->save();
        return response()->json(['session' => $session->fresh()]);
    }

    public function close(string $id): JsonResponse
    {
        $session = TableSession::findOrFail($id);
        $session->update(['status' => 'closed', 'closed_at' => now()]);
        $session->table?->update(['status' => 'available']);
        return response()->json(['session' => $session->fresh()]);
    }

    public function summary(string $id, OrderCalculatorService $calc): JsonResponse
    {
        $session = TableSession::with('orders.items', 'package')->findOrFail($id);
        $bill = $calc->calculateBill($session);
        return response()->json([
            'session' => $session,
            'bill' => $bill,
        ]);
    }

    public function timer(string $id): JsonResponse
    {
        $session = TableSession::findOrFail($id);
        $now = now();
        $remaining = $session->expires_at?->diffInSeconds($now, false);
        return response()->json([
            'expires_at' => $session->expires_at,
            'last_order_at' => $session->last_order_at,
            'remaining_seconds' => $remaining > 0 ? $remaining : 0,
            'is_expired' => $session->expires_at && $session->expires_at->isPast(),
        ]);
    }
}
