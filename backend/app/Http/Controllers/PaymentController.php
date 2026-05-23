<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\TableSession;
use App\Services\OrderCalculatorService;
use App\Services\QrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function forSession(string $sessionId, OrderCalculatorService $calc): JsonResponse
    {
        $session = TableSession::with('orders.items', 'package')->findOrFail($sessionId);
        $bill = $calc->calculateBill($session);
        $payment = Payment::firstWhere('session_id', $sessionId);
        return response()->json(['session' => $session, 'bill' => $bill, 'payment' => $payment]);
    }

    public function create(Request $request, OrderCalculatorService $calc): JsonResponse
    {
        $request->validate([
            'session_id' => ['required', 'uuid', 'exists:table_sessions,id'],
            'method' => ['required', 'in:cash,qr_promptpay,credit_card,bank_transfer'],
        ]);

        $session = TableSession::with('orders.items', 'package')->findOrFail($request->session_id);
        $bill = $calc->calculateBill($session);
        $receipt = 'REC-' . now()->format('Ymd') . '-' . str_pad((string) (Payment::count() + 1), 4, '0', STR_PAD_LEFT);

        $payment = Payment::firstOrCreate(
            ['session_id' => $session->id],
            [
                'restaurant_id' => $session->restaurant_id,
                'receipt_number' => $receipt,
                'method' => $request->method,
                'status' => 'unpaid',
                'subtotal' => $bill['subtotal'],
                'package_charge' => $bill['packageCharge'],
                'addon_charge' => $bill['addonCharge'],
                'extension_charge' => $bill['extensionCharge'],
                'service_charge' => $bill['serviceCharge'],
                'vat_amount' => $bill['vat'],
                'total' => $bill['total'],
            ],
        );

        return response()->json(['payment' => $payment, 'bill' => $bill], 201);
    }

    public function markPaid(Request $request, string $id): JsonResponse
    {
        $payment = Payment::findOrFail($id);
        $data = $request->validate([
            'amount_paid' => ['nullable', 'numeric', 'min:0'],
        ]);
        $payment->update([
            'status' => 'paid',
            'paid_at' => now(),
            'amount_paid' => $data['amount_paid'] ?? $payment->total,
            'change_amount' => isset($data['amount_paid'])
                ? max(0, $data['amount_paid'] - $payment->total)
                : 0,
        ]);
        // Close session + free table
        $session = $payment->session;
        $session?->update(['status' => 'closed', 'closed_at' => now()]);
        $session?->table?->update(['status' => 'available']);
        return response()->json(['payment' => $payment->fresh()]);
    }

    public function generateQr(Request $request, string $id, QrCodeService $qr): JsonResponse
    {
        $payment = Payment::findOrFail($id);
        // In production: call GBPrimePay API. For now: emit a placeholder PromptPay-style payload.
        $payload = "PROMPTPAY|amount={$payment->total}|receipt={$payment->receipt_number}";
        return response()->json([
            'payment' => $payment,
            'qr_payload' => $payload,
            'qr_image' => $qr->dataUri($payload),
        ]);
    }

    public function uploadSlip(Request $request, string $id): JsonResponse
    {
        $payment = Payment::findOrFail($id);
        $request->validate(['slip_url' => ['required', 'string']]);
        $payment->update([
            'slip_url' => $request->slip_url,
            'status' => 'pending_verify',
        ]);
        return response()->json(['payment' => $payment]);
    }

    public function verifySlip(string $id): JsonResponse
    {
        $payment = Payment::findOrFail($id);
        $payment->update([
            'slip_verified' => true,
            'verified_at' => now(),
            'status' => 'paid',
            'paid_at' => now(),
        ]);
        $payment->session?->update(['status' => 'closed', 'closed_at' => now()]);
        $payment->session?->table?->update(['status' => 'available']);
        return response()->json(['payment' => $payment->fresh()]);
    }
}
