"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useRealtime } from "@/lib/realtime";

/**
 * Mount-once bridge — calls useRealtime() with the current user's
 * restaurant_id. Renders nothing.
 */
export function RealtimeBridge() {
  const restaurantId = useAuthStore((s) => s.user?.restaurant_id);
  useRealtime(restaurantId);
  return null;
}
