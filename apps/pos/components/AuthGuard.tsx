"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { usePosStore } from "@/lib/pos-store";

/**
 * Wraps protected dashboard pages: re-hydrates the bearer token from
 * localStorage on mount, verifies it against /auth/me, then either
 * lets children render or redirects to /login.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const rehydrate = useAuthStore((s) => s.rehydrate);
  const hydrateFromApi = usePosStore((s) => s.hydrateFromApi);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        router.replace("/login");
        return;
      }
      await rehydrate();
      if (!cancelled) {
        const stillHasUser = useAuthStore.getState().user;
        if (!stillHasUser) {
          router.replace("/login");
        } else {
          // Hydrate POS state from real backend
          await hydrateFromApi();
          setChecking(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100">
        <div className="flex flex-col items-center gap-3 text-ink-500">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <span className="text-sm">กำลังตรวจสอบสิทธิ์...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
