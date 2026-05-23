"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

export type ApiTable = {
  id: string;
  name: string;
  capacity: number;
  zone: string;
  qr_type: "static" | "dynamic";
  status: "available" | "occupied" | "billing" | "closed";
  active_session?: ApiSession | null;
};

export type ApiSession = {
  id: string;
  table_id: string;
  guest_count: number;
  guest_adult?: number;
  guest_child?: number;
  package_id?: string | null;
  opened_at: string;
  expires_at?: string | null;
};

/**
 * Fetches tables (+ their active sessions) from the backend with a
 * refresh interval. Returns a tuple [tables, refresh, status].
 */
export function useTables(refreshMs = 15_000) {
  const [tables, setTables] = useState<ApiTable[]>([]);
  const [status, setStatus] = useState<"loading" | "idle" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const data = (await api.tables()) as { tables: ApiTable[] };
      setTables(data.tables);
      setStatus("idle");
      setError(null);
    } catch (e: unknown) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "fetch failed");
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, refreshMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { tables, refresh, status, error };
}
