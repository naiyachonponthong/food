"use client";

import { Bell, Receipt, Users, Clock, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { cn, formatDuration, formatPrice } from "@/lib/utils";
import { tableDisplayCode } from "@/lib/mock-data";
import type { Session, Table } from "@/lib/pos-store";

const STATUS_STYLES: Record<
  Table["status"],
  { ring: string; bg: string; chip: string; label: string }
> = {
  available: {
    ring: "ring-cream-300",
    bg: "bg-white",
    chip: "bg-herb-50 text-herb-700",
    label: "ว่าง",
  },
  occupied: {
    ring: "ring-amber-200",
    bg: "bg-amber-50/30",
    chip: "bg-amber-100 text-amber-700",
    label: "มีลูกค้า",
  },
  billing: {
    ring: "ring-blue-300",
    bg: "bg-blue-50/40",
    chip: "bg-blue-100 text-blue-700",
    label: "รอชำระ",
  },
  closed: {
    ring: "ring-cream-300",
    bg: "bg-cream-100",
    chip: "bg-ink-100 text-ink-500",
    label: "ปิด",
  },
};

export function TableCard({
  table,
  session,
  onClick,
}: {
  table: Table;
  session: Session | null;
  onClick?: () => void;
}) {
  const styles = STATUS_STYLES[table.status];
  const hasCall = !!session?.hasCallStaff;
  const hasBill = !!session?.hasBillRequest;

  const [duration, setDuration] = useState("");
  useEffect(() => {
    if (!session) return;
    const update = () => setDuration(formatDuration(Date.now() - session.openedAt));
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, [session]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-stretch overflow-hidden rounded-2xl ring-1 p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft",
        styles.ring,
        styles.bg,
      )}
    >
      {/* Status pulse for urgent (call / bill) */}
      {(hasCall || hasBill) && (
        <div className="absolute right-2 top-2 flex h-7 items-center gap-1 rounded-full bg-brand-500 px-2 text-[10px] font-bold uppercase text-white shadow-pop">
          {hasCall ? (
            <>
              <Bell className="h-3 w-3 animate-pulse-soft" />
              <span>เรียก</span>
            </>
          ) : (
            <>
              <Receipt className="h-3 w-3" />
              <span>เช็คบิล</span>
            </>
          )}
        </div>
      )}

      <div className="flex items-baseline justify-between">
        <div className="text-3xl font-bold tabular text-ink-800">
          {table.name}
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
            styles.chip,
          )}
        >
          {styles.label}
        </span>
      </div>

      <div className="mt-0.5 flex items-center gap-1.5 text-[10px]">
        <span className="font-mono text-ink-400">
          {tableDisplayCode(table.name)}
        </span>
        {session?.isBuffet && (
          <span className="inline-flex items-center gap-0.5 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
            <Crown className="h-2 w-2" />
            BUF
          </span>
        )}
      </div>

      <div className="mt-1 flex items-center gap-1 text-[11px] text-ink-400">
        <Users className="h-3 w-3" />
        <span>{session ? `${session.guestCount}/${table.capacity}` : `${table.capacity} ที่นั่ง`}</span>
      </div>

      {session ? (
        <div className="mt-2 border-t border-dashed border-cream-300 pt-2">
          <div className="flex items-center gap-1 text-[10px] text-ink-500">
            <Clock className="h-3 w-3" />
            <span className="tabular">{duration}</span>
          </div>
          <div className="mt-0.5 flex items-baseline justify-between">
            <span className="text-[10px] text-ink-400">{session.itemsCount} รายการ</span>
            <span className="text-sm font-bold text-ink-800 tabular">
              {formatPrice(session.totalAmount)}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-2 border-t border-dashed border-cream-300 pt-2 text-[10px] text-ink-300">
          QR {table.qrType === "static" ? "ติดที่โต๊ะ" : "พิมพ์ใหม่"}
        </div>
      )}
    </button>
  );
}
