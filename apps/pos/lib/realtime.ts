"use client";

import { useEffect, useRef } from "react";
import { usePosStore } from "./pos-store";

/**
 * Real-time bridge.
 *
 * Two strategies, picked at runtime:
 *
 * 1. NEXT_PUBLIC_PUSHER_KEY is set — connect to Pusher, subscribe to
 *    private-restaurant.{id} + private-kitchen.{id}, and dispatch
 *    incoming events into the pos-store. (Auth endpoint at
 *    /broadcasting/auth on the Laravel backend.)
 *
 * 2. No Pusher key — fall back to lightweight polling: re-fetch
 *    tables / orders / notifications every N seconds via the API.
 *    This is what runs in the sandbox dev environment, and keeps the
 *    POS reactive even without WebSockets.
 *
 * Either way the rest of the UI just reads pos-store and re-renders;
 * neither cares which transport delivered the update.
 */
export function useRealtime(restaurantId: string | undefined) {
  const hydrate = usePosStore((s) => s.hydrateFromApi);
  const lastHydrate = useRef(0);

  useEffect(() => {
    if (!restaurantId) return;

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap1";

    if (pusherKey) {
      // -- Pusher transport (production)
      let unsub: (() => void) | null = null;
      (async () => {
        // Lazy-load pusher-js so it's only fetched when configured.
        const { default: Pusher } = await import("pusher-js");
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("plearn-pos-token")
            : null;
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
        const authEndpoint = apiBase.replace(/\/api\/v1$/, "") + "/broadcasting/auth";

        const p = new Pusher(pusherKey, {
          cluster: pusherCluster,
          authEndpoint,
          auth: {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        });

        const restCh = p.subscribe(`private-restaurant.${restaurantId}`);
        const kitchenCh = p.subscribe(`private-kitchen.${restaurantId}`);

        const onAny = () => {
          // Coalesce: refresh store at most every 1.5s
          if (Date.now() - lastHydrate.current > 1500) {
            lastHydrate.current = Date.now();
            hydrate();
          }
        };
        ["new-order", "call-staff", "bill-request", "payment-received",
         "last-order-warning", "timer-warning", "timer-expired",
         "time-extended"].forEach((ev) => {
          restCh.bind(ev, onAny);
          kitchenCh.bind(ev, onAny);
        });

        unsub = () => {
          p.unsubscribe(`private-restaurant.${restaurantId}`);
          p.unsubscribe(`private-kitchen.${restaurantId}`);
          p.disconnect();
        };
      })();
      return () => {
        unsub?.();
      };
    }

    // -- Polling fallback (sandbox / dev)
    const id = setInterval(() => {
      hydrate();
    }, 5_000);
    return () => clearInterval(id);
  }, [restaurantId, hydrate]);
}
