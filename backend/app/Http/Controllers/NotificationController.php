<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $list = Notification::where('restaurant_id', $request->user()->restaurant_id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();
        return response()->json(['notifications' => $list]);
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        $n = Notification::where('restaurant_id', $request->user()->restaurant_id)
            ->findOrFail($id);
        $n->update(['is_read' => true]);
        return response()->json(['ok' => true]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        Notification::where('restaurant_id', $request->user()->restaurant_id)
            ->update(['is_read' => true]);
        return response()->json(['ok' => true]);
    }
}
