<?php

use App\Models\TableSession;
use Illuminate\Support\Facades\Broadcast;

// Restaurant-wide private channel for POS staff
Broadcast::channel('restaurant.{restaurantId}', function ($user, $restaurantId) {
    return $user && $user->restaurant_id === $restaurantId;
});

// Kitchen-only channel (kitchen role or any restaurant staff)
Broadcast::channel('kitchen.{restaurantId}', function ($user, $restaurantId) {
    return $user && $user->restaurant_id === $restaurantId;
});

// Presence channel scoped to a session token — customers join via token,
// no auth required (return a minimal payload).
Broadcast::channel('table.{token}', function ($user, string $token) {
    $session = TableSession::where('token', $token)->where('status', 'active')->first();
    if (!$session) return false;
    return ['session_id' => $session->id, 'table_id' => $session->table_id];
});
