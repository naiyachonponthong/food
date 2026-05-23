"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, ChefHat, Check, Sparkles, AlertCircle, Crown } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { orderDisplayCode, tableDisplayCode } from "@/lib/mock-data";
import { usePosStore } from "@/lib/pos-store";
import { cn, formatTime } from "@/lib/utils";
import type { OrderItem, OrderItemStatus } from "@/lib/mock-data";

export default function KitchenPage() {
  const orders = usePosStore((s) => s.orders);
  const updateItem = usePosStore((s) => s.updateOrderItemStatus);

  // Only show orders with at least one non-served, non-cancelled item
  const activeOrders = useMemo(() => {
    return orders
      .filter((o) =>
        o.items.some((it) => it.status !== "served" && it.status !== "cancelled"),
      )
      .sort((a, b) => a.placedAt - b.placedAt);
  }, [orders]);

  return (
    <>
      <TopBar
        title="Kitchen Display"
        subtitle={`${activeOrders.length} ออเดอร์ในคิว · เรียงตามเวลาสั่ง`}
      />
      <main className="flex-1 overflow-y-auto bg-cream-100 p-6">
        {activeOrders.length === 0 ? (
          <EmptyKitchen />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeOrders.map((order) => (
              <KitchenTicket
                key={order.id}
                order={order}
                onUpdateItem={(itemId, status) =>
                  updateItem(order.id, itemId, status)
                }
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function KitchenTicket({
  order,
  onUpdateItem,
}: {
  order: ReturnType<typeof usePosStore.getState>["orders"][number];
  onUpdateItem: (itemId: string, status: OrderItemStatus) => void;
}) {
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  const elapsedMin = Math.floor((now - order.placedAt) / 60000);
  const urgent = elapsedMin >= 12;
  const warning = elapsedMin >= 7 && elapsedMin < 12;

  const pendingItems = order.items.filter(
    (it) => it.status !== "served" && it.status !== "cancelled",
  );

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft ring-1 transition-all",
        urgent
          ? "ring-2 ring-brand-500"
          : warning
            ? "ring-amber-300"
            : "ring-cream-300",
      )}
    >
      <header
        className={cn(
          "flex items-center justify-between border-b px-4 py-3",
          urgent
            ? "border-brand-200 bg-brand-50"
            : warning
              ? "border-amber-200 bg-amber-50"
              : "border-cream-200 bg-cream-50",
        )}
      >
        <div>
          <div className="flex items-center gap-2">
            <div className="font-mono text-lg font-bold text-ink-800">
              {tableDisplayCode(order.tableName)}
            </div>
            <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink-600">
              รอบ {order.roundNumber}
            </span>
          </div>
          <div className="text-[10px] text-ink-500">{order.tableName}</div>
        </div>
        <div className="flex flex-col items-end">
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-bold tabular",
              urgent ? "text-brand-700" : warning ? "text-amber-700" : "text-ink-700",
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            {elapsedMin}m
          </div>
          <div className="text-[10px] text-ink-400 tabular">
            {formatTime(order.placedAt)}
          </div>
        </div>
      </header>

      <ul className="flex-1 divide-y divide-cream-100">
        {order.items.map((it) => (
          <KitchenItem
            key={it.id}
            item={it}
            onUpdate={(s) => onUpdateItem(it.id, s)}
          />
        ))}
      </ul>

      <footer className="border-t border-cream-200 bg-cream-50 px-4 py-2.5 text-[11px]">
        <div className="flex items-center justify-between text-ink-500">
          <span className="font-mono">{orderDisplayCode(order.id, order.placedAt)}</span>
          <span>
            ค้างทำ {pendingItems.length}/{order.items.length} รายการ
          </span>
        </div>
      </footer>
    </div>
  );
}

function KitchenItem({
  item,
  onUpdate,
}: {
  item: OrderItem;
  onUpdate: (status: OrderItemStatus) => void;
}) {
  const done = item.status === "served";
  const ready = item.status === "ready";
  const preparing = item.status === "preparing";

  // Next action based on current status
  const nextAction =
    item.status === "pending" || item.status === "confirmed"
      ? { label: "เริ่มทำ", icon: ChefHat, next: "preparing" as const, color: "bg-brand-500" }
      : preparing
        ? { label: "พร้อมเสิร์ฟ", icon: Sparkles, next: "ready" as const, color: "bg-blue-500" }
        : ready
          ? { label: "เสิร์ฟแล้ว", icon: Check, next: "served" as const, color: "bg-herb-500" }
          : null;

  return (
    <li
      className={cn(
        "flex flex-col gap-2 px-4 py-3 transition-all",
        done && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-ink-800 tabular">
              {item.quantity}x
            </span>
            <span className="text-sm font-semibold text-ink-800 leading-tight">
              {item.name}
            </span>
          </div>
          {item.options.length > 0 && (
            <div className="mt-0.5 text-xs text-brand-700 font-medium">
              {item.options.map((o) => o.name).join(" · ")}
            </div>
          )}
          {item.note && (
            <div className="mt-0.5 flex items-start gap-1 text-xs text-amber-700">
              <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
              <span className="italic">{item.note}</span>
            </div>
          )}
        </div>
      </div>

      {nextAction && (
        <button
          onClick={() => onUpdate(nextAction.next)}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white",
            nextAction.color,
          )}
        >
          <nextAction.icon className="h-3.5 w-3.5" />
          {nextAction.label}
        </button>
      )}
    </li>
  );
}

function EmptyKitchen() {
  return (
    <div className="flex flex-col items-center justify-center pt-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-herb-100">
        <Check className="h-10 w-10 text-herb-600" strokeWidth={2} />
      </div>
      <h2 className="mt-5 text-xl font-bold text-ink-800">ครัวว่าง!</h2>
      <p className="mt-1 text-sm text-ink-400">ออเดอร์ทั้งหมดเสิร์ฟครบแล้ว</p>
    </div>
  );
}
