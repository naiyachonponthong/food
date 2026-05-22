"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Users,
  Clock,
  CheckCheck,
  ChefHat,
  Sparkles,
  Bell,
  Receipt,
  XCircle,
  Printer,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePosStore } from "@/lib/pos-store";
import { cn, formatDuration, formatPrice, formatTime } from "@/lib/utils";
import type { OrderItemStatus } from "@/lib/mock-data";

const STATUS_OPTIONS: Array<{
  value: OrderItemStatus;
  label: string;
  color: string;
}> = [
  { value: "confirmed", label: "ครัวรับ", color: "bg-amber-100 text-amber-700" },
  { value: "preparing", label: "กำลังทำ", color: "bg-brand-100 text-brand-700" },
  { value: "ready", label: "พร้อมเสิร์ฟ", color: "bg-blue-100 text-blue-700" },
  { value: "served", label: "เสิร์ฟแล้ว", color: "bg-herb-100 text-herb-700" },
];

export function TableDetailDrawer() {
  const open = usePosStore((s) => s.drawerOpen);
  const setOpen = usePosStore((s) => s.setDrawer);
  const selectedId = usePosStore((s) => s.selectedTableId);
  const table = usePosStore((s) =>
    s.tables.find((t) => t.id === selectedId),
  );
  const allSessions = usePosStore((s) => s.sessions);
  const allOrders = usePosStore((s) => s.orders);
  const session = useMemo(
    () =>
      selectedId
        ? (allSessions.find((s) => s.tableId === selectedId) ?? null)
        : null,
    [selectedId, allSessions],
  );
  const orders = useMemo(
    () =>
      selectedId
        ? allOrders
            .filter((o) => o.tableId === selectedId)
            .sort((a, b) => b.placedAt - a.placedAt)
        : [],
    [selectedId, allOrders],
  );
  const updateItem = usePosStore((s) => s.updateOrderItemStatus);
  const closeTable = usePosStore((s) => s.closeTable);
  const ackCall = usePosStore((s) => s.ackCallStaff);
  const markPaid = usePosStore((s) => s.markBillPaid);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30000);
    return () => clearInterval(t);
  }, []);

  if (!table) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-ink-900/30 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[480px] flex-col bg-cream-50 shadow-lift"
          >
            <header className="flex items-start justify-between border-b border-cream-200 bg-white px-5 py-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                  โต๊ะ
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-ink-800 tabular">
                    {table.name}
                  </span>
                  <span className="text-sm text-ink-400">·</span>
                  <span className="text-sm text-ink-500">{table.zone}</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="ปิด"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-100 text-ink-600 hover:bg-cream-200"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto">
              {!session ? (
                <EmptyState
                  onOpen={() => {
                    setOpen(false);
                    usePosStore.getState().setOpenTableModal(true);
                  }}
                  tableName={table.name}
                />
              ) : (
                <div className="space-y-4 px-5 py-5">
                  {/* Session info */}
                  <section className="rounded-2xl bg-white p-4 shadow-soft">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-ink-500">
                        <Users className="h-4 w-4" />
                        <span>{session.guestCount} คน</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-ink-500">
                        <Clock className="h-4 w-4" />
                        <span className="tabular">
                          {formatDuration(Date.now() - session.openedAt)}
                        </span>
                      </div>
                      <div className="text-xs text-ink-400">
                        เริ่ม {formatTime(session.openedAt)}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-dashed border-cream-300 pt-3">
                      <span className="text-xs text-ink-400">ยอดสะสม</span>
                      <span className="text-xl font-bold text-ink-800 tabular">
                        {formatPrice(session.totalAmount)}
                      </span>
                    </div>
                  </section>

                  {/* Urgent actions */}
                  {session.hasCallStaff && (
                    <div className="flex items-center gap-3 rounded-2xl border-2 border-brand-200 bg-brand-50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
                        <Bell className="h-4 w-4 animate-pulse-soft" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-brand-800">
                          เรียกพนักงาน
                        </div>
                        <div className="text-xs text-brand-700">
                          {session.hasCallStaff.reason}
                        </div>
                      </div>
                      <button
                        onClick={() => ackCall(session.id)}
                        className="rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white"
                      >
                        รับทราบ
                      </button>
                    </div>
                  )}
                  {session.hasBillRequest && (
                    <div className="flex items-center gap-3 rounded-2xl border-2 border-blue-200 bg-blue-50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-blue-800">
                          ขอเช็คบิล
                        </div>
                        <div className="text-xs text-blue-700">
                          ลูกค้าพร้อมชำระ — {formatPrice(session.totalAmount)}
                        </div>
                      </div>
                      <button
                        onClick={() => markPaid(session.id)}
                        className="rounded-xl bg-blue-500 px-3 py-2 text-xs font-semibold text-white"
                      >
                        ชำระแล้ว
                      </button>
                    </div>
                  )}

                  {/* Orders */}
                  <section>
                    <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink-500">
                      ออเดอร์ทั้งหมด ({orders.length} รอบ)
                    </h3>
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="overflow-hidden rounded-2xl bg-white shadow-soft"
                        >
                          <header className="flex items-center justify-between border-b border-cream-200 bg-cream-50 px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-700">
                                รอบ {order.roundNumber}
                              </span>
                              <span className="font-mono text-xs text-ink-500">
                                {order.orderNumber}
                              </span>
                            </div>
                            <span className="text-[10px] tabular text-ink-400">
                              {formatTime(order.placedAt)}
                            </span>
                          </header>
                          <ul className="divide-y divide-cream-100">
                            {order.items.map((it) => (
                              <li key={it.id} className="px-4 py-2.5">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-ink-800">
                                      <span className="tabular">{it.quantity}×</span>{" "}
                                      {it.name}
                                    </div>
                                    {(it.options.length > 0 || it.note) && (
                                      <div className="mt-0.5 text-[11px] text-ink-400">
                                        {[
                                          ...it.options.map((o) => o.name),
                                          it.note ? `“${it.note}”` : "",
                                        ]
                                          .filter(Boolean)
                                          .join(" · ")}
                                      </div>
                                    )}
                                    <div className="mt-0.5 text-[10px] text-ink-400">
                                      สั่งโดย {it.orderedBy}
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 text-right text-sm font-semibold text-ink-800 tabular">
                                    {formatPrice(it.price * it.quantity)}
                                  </div>
                                </div>
                                {/* Status pills */}
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {STATUS_OPTIONS.map((s) => (
                                    <button
                                      key={s.value}
                                      onClick={() =>
                                        updateItem(order.id, it.id, s.value)
                                      }
                                      className={cn(
                                        "rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all",
                                        it.status === s.value
                                          ? s.color
                                          : "bg-cream-100 text-ink-400 hover:bg-cream-200",
                                      )}
                                    >
                                      {s.label}
                                    </button>
                                  ))}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </div>

            {/* Footer */}
            {session && (
              <footer className="border-t border-cream-200 bg-white px-5 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => closeTable(table.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-2xl border-2 border-cream-300 bg-white py-3 text-sm font-semibold text-ink-700 hover:bg-cream-100"
                  >
                    <XCircle className="h-4 w-4" />
                    ปิดโต๊ะ
                  </button>
                  <button
                    onClick={() => markPaid(session.id)}
                    className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-pop hover:bg-brand-600"
                  >
                    <Receipt className="h-4 w-4" />
                    ชำระเงิน · {formatPrice(session.totalAmount)}
                  </button>
                </div>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyState({
  onOpen,
  tableName,
}: {
  onOpen: () => void;
  tableName: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-herb-100">
        <CheckCheck className="h-8 w-8 text-herb-600" strokeWidth={2} />
      </div>
      <h3 className="mt-4 text-lg font-bold text-ink-800">
        โต๊ะ {tableName} ว่าง
      </h3>
      <p className="mt-1 text-sm text-ink-400">
        พร้อมเปิดให้ลูกค้าใหม่ได้เลย
      </p>
      <button
        onClick={onOpen}
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-pop hover:bg-brand-600"
      >
        <Sparkles className="h-4 w-4" />
        เปิดโต๊ะใหม่
      </button>
    </div>
  );
}
