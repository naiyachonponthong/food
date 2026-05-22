"use client";

import { Bell, Plus, Sparkles, Search } from "lucide-react";
import { useState } from "react";
import { usePosStore } from "@/lib/pos-store";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { cn } from "@/lib/utils";

export function TopBar({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = usePosStore((s) => s.unreadCount());
  const triggerRandom = usePosStore((s) => s.triggerRandomEvent);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-cream-200 bg-white/80 px-6 py-4 backdrop-blur">
      <div>
        <h1 className="text-2xl font-bold leading-tight text-ink-800">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {action}

        {/* Demo: simulate event */}
        <button
          onClick={triggerRandom}
          title="จำลองเหตุการณ์ — ออเดอร์ใหม่ / เรียกพนักงาน (สำหรับเดโม)"
          className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-dashed border-brand-300 bg-brand-50/50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          จำลองเหตุการณ์
        </button>

        <div className="relative">
          <button
            aria-label="การแจ้งเตือน"
            onClick={() => setNotifOpen(!notifOpen)}
            className={cn(
              "relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cream-300 bg-white text-ink-700 hover:bg-cream-50",
              notifOpen && "bg-cream-100",
            )}
          >
            <Bell className="h-5 w-5" strokeWidth={2} />
            {unread > 0 && (
              <>
                <span className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white tabular ring-2 ring-white">
                  {unread > 9 ? "9+" : unread}
                </span>
                <span className="absolute right-1.5 top-1.5 h-5 w-5 rounded-full bg-brand-500/40 animate-pulse-ring" />
              </>
            )}
          </button>

          <NotificationsDropdown open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>
      </div>
    </header>
  );
}
