"use client";

import { useMemo, useState } from "react";
import { Clock, ChevronRight, Search } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { usePosStore } from "@/lib/pos-store";
import { orderDisplayCode, tableDisplayCode } from "@/lib/mock-data";
import { cn, formatPrice, formatTime } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "pending", label: "รอครัวรับ" },
  { value: "confirmed", label: "ครัวรับแล้ว" },
  { value: "preparing", label: "กำลังทำ" },
  { value: "ready", label: "พร้อมเสิร์ฟ" },
  { value: "served", label: "เสิร์ฟแล้ว" },
] as const;

type FilterValue = (typeof STATUS_FILTERS)[number]["value"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-ink-100 text-ink-600",
  confirmed: "bg-amber-100 text-amber-700",
  preparing: "bg-brand-100 text-brand-700",
  ready: "bg-blue-100 text-blue-700",
  served: "bg-herb-100 text-herb-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "รอครัวรับ",
  confirmed: "ครัวรับแล้ว",
  preparing: "กำลังทำ",
  ready: "พร้อมเสิร์ฟ",
  served: "เสิร์ฟแล้ว",
  cancelled: "ยกเลิก",
};

export default function OrdersPage() {
  const orders = usePosStore((s) => s.orders);
  const selectTable = usePosStore((s) => s.selectTable);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== "all") list = list.filter((o) => o.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.tableName.toLowerCase().includes(q) ||
          o.items.some((it) => it.name.toLowerCase().includes(q)),
      );
    }
    return [...list].sort((a, b) => b.placedAt - a.placedAt);
  }, [orders, filter, query]);

  return (
    <>
      <TopBar
        title="ออเดอร์"
        subtitle={`${orders.length} ออเดอร์รวม วันนี้`}
      />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Filters + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 sm:mx-0 sm:px-0">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                  filter === f.value
                    ? "bg-ink-800 text-white"
                    : "bg-white text-ink-600 border border-cream-300 hover:border-cream-400",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหา ORD / โต๊ะ / เมนู"
              className="w-full rounded-full border border-cream-300 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-ink-300 focus:border-brand-300 sm:w-72"
            />
          </div>
        </div>

        {/* Orders table */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft">
          <div className="grid grid-cols-[80px_60px_1fr_auto_120px_auto] items-center gap-4 border-b border-cream-200 bg-cream-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
            <div>โต๊ะ</div>
            <div>รอบ</div>
            <div>รายการ</div>
            <div className="text-right">ยอด</div>
            <div>สถานะ</div>
            <div className="text-right">เวลา</div>
          </div>
          <ul className="divide-y divide-cream-100">
            {filtered.length === 0 ? (
              <li className="px-5 py-12 text-center text-sm text-ink-400">
                ไม่มีออเดอร์ในเงื่อนไขที่เลือก
              </li>
            ) : (
              filtered.map((o) => (
                <li
                  key={o.id}
                  onClick={() => selectTable(o.tableId)}
                  className="grid cursor-pointer grid-cols-[80px_60px_1fr_auto_120px_auto] items-center gap-4 px-5 py-3 transition-all hover:bg-cream-50"
                >
                  <div>
                    <div className="font-mono text-sm font-bold text-ink-800 tabular">
                      {tableDisplayCode(o.tableName)}
                    </div>
                    <div className="text-[10px] text-ink-400">{o.tableName}</div>
                  </div>
                  <div className="text-xs font-medium text-ink-500 tabular">
                    #{o.roundNumber}
                  </div>
                  <div className="min-w-0">
                    <div className="line-clamp-1 text-sm font-medium text-ink-800">
                      {o.items
                        .map((it) => `${it.quantity}× ${it.name}`)
                        .join(", ")}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-ink-400">
                      {orderDisplayCode(o.id, o.placedAt)}
                    </div>
                  </div>
                  <div className="text-right text-sm font-bold text-ink-800 tabular">
                    {formatPrice(o.total)}
                  </div>
                  <div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        STATUS_COLORS[o.status] ?? "bg-cream-100 text-ink-600",
                      )}
                    >
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 justify-end text-[11px] text-ink-400 tabular">
                    <Clock className="h-3 w-3" />
                    {formatTime(o.placedAt)}
                    <ChevronRight className="ml-1 h-4 w-4 text-ink-300" />
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </main>
    </>
  );
}
