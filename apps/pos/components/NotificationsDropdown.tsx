"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCheck,
  Bell,
  Utensils,
  ChefHat,
  Receipt,
  CreditCard,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { usePosStore } from "@/lib/pos-store";
import { formatRelative } from "@/lib/utils";
import type { Notification } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const typeMeta: Record<
  Notification["type"],
  { icon: React.ReactNode; color: string }
> = {
  "new-order": {
    icon: <Utensils className="h-4 w-4" />,
    color: "bg-brand-100 text-brand-700",
  },
  "call-staff": {
    icon: <Bell className="h-4 w-4" />,
    color: "bg-amber-100 text-amber-700",
  },
  "bill-request": {
    icon: <Receipt className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-700",
  },
  "payment-received": {
    icon: <CreditCard className="h-4 w-4" />,
    color: "bg-herb-100 text-herb-700",
  },
};

export function NotificationsDropdown({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const list = usePosStore((s) => s.notifications);
  const markRead = usePosStore((s) => s.markNotificationsRead);
  const clear = usePosStore((s) => s.clearNotification);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  const unread = list.filter((n) => !n.isRead);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-12 z-40 w-[380px] overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-lift"
        >
          <div className="flex items-center justify-between border-b border-cream-200 px-4 py-3">
            <div>
              <div className="text-base font-bold text-ink-800">
                การแจ้งเตือน
              </div>
              <div className="text-xs text-ink-400">
                {unread.length > 0
                  ? `${unread.length} รายการที่ยังไม่ได้อ่าน`
                  : "ทุกอย่างเรียบร้อย"}
              </div>
            </div>
            {unread.length > 0 && (
              <button
                onClick={() => markRead()}
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                อ่านทั้งหมด
              </button>
            )}
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            {list.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-ink-400">
                ไม่มีการแจ้งเตือน
              </div>
            ) : (
              <ul className="divide-y divide-cream-100">
                {list.map((n) => {
                  const meta = typeMeta[n.type];
                  return (
                    <li
                      key={n.id}
                      className={cn(
                        "group relative flex gap-3 px-4 py-3 transition-all hover:bg-cream-50",
                        !n.isRead && "bg-brand-50/30",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl",
                          meta.color,
                        )}
                      >
                        {meta.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="rounded-md bg-cream-200 px-1.5 py-0.5 text-[10px] font-bold text-ink-700">
                            โต๊ะ {n.tableName}
                          </span>
                          <span className="truncate text-sm font-semibold text-ink-800">
                            {n.title}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-xs text-ink-500">
                          {n.body}
                        </div>
                        <div className="mt-1 text-[10px] text-ink-400 tabular">
                          {formatRelative(n.at)}
                        </div>
                      </div>
                      <button
                        aria-label="ลบ"
                        onClick={() => clear(n.id)}
                        className="hidden h-7 w-7 items-center justify-center rounded-full text-ink-400 hover:bg-cream-200 hover:text-ink-600 group-hover:flex"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {!n.isRead && (
                        <span className="absolute right-2 top-3 h-2 w-2 rounded-full bg-brand-500" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
