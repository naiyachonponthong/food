"use client";

import { useMemo, useState } from "react";
import { Plus, ListFilter } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { TableCard } from "@/components/TableCard";
import { usePosStore } from "@/lib/pos-store";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "ทั้งหมด", color: "" },
  { value: "available", label: "ว่าง", color: "bg-herb-500" },
  { value: "occupied", label: "มีลูกค้า", color: "bg-amber-500" },
  { value: "billing", label: "รอชำระ", color: "bg-blue-500" },
] as const;

type FilterValue = (typeof STATUS_FILTERS)[number]["value"];

export default function TablesPage() {
  const tables = usePosStore((s) => s.tables);
  const setOpenTableModal = usePosStore((s) => s.setOpenTableModal);
  const selectTable = usePosStore((s) => s.selectTable);
  const sessions = usePosStore((s) => s.sessions);
  const [filter, setFilter] = useState<FilterValue>("all");

  const stats = useMemo(() => {
    const t = (s: string) => tables.filter((x) => x.status === s).length;
    return {
      total: tables.length,
      available: t("available"),
      occupied: t("occupied"),
      billing: t("billing"),
    };
  }, [tables]);

  const filtered =
    filter === "all" ? tables : tables.filter((t) => t.status === filter);

  // Group by zone
  const zones = Array.from(new Set(filtered.map((t) => t.zone)));

  return (
    <>
      <TopBar
        title="โต๊ะอาหาร"
        subtitle={`${stats.occupied + stats.billing}/${stats.total} โต๊ะกำลังใช้งาน`}
        action={
          <button
            onClick={() => setOpenTableModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-pop hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            เปิดโต๊ะใหม่
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="โต๊ะทั้งหมด" value={stats.total} tone="default" />
          <StatCard
            label="ว่าง"
            value={stats.available}
            tone="herb"
            dot
          />
          <StatCard
            label="มีลูกค้า"
            value={stats.occupied}
            tone="amber"
            dot
          />
          <StatCard
            label="รอชำระ"
            value={stats.billing}
            tone="blue"
            dot
          />
        </div>

        {/* Filters */}
        <div className="mt-6 flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">
            <ListFilter className="h-3.5 w-3.5" />
            กรอง
          </div>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                filter === f.value
                  ? "bg-ink-800 text-white"
                  : "bg-white text-ink-600 border border-cream-300 hover:border-cream-400",
              )}
            >
              {f.color && (
                <span className={cn("h-1.5 w-1.5 rounded-full", f.color)} />
              )}
              {f.label}
            </button>
          ))}
        </div>

        {/* Tables by zone */}
        <div className="mt-6 space-y-6">
          {zones.map((zone) => {
            const zoneTables = filtered.filter((t) => t.zone === zone);
            return (
              <section key={zone}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="text-base font-bold text-ink-800">{zone}</h2>
                  <span className="text-xs text-ink-400">
                    {zoneTables.length} โต๊ะ
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
                  {zoneTables.map((table) => (
                    <TableCard
                      key={table.id}
                      table={table}
                      session={
                        sessions.find((s) => s.tableId === table.id) ?? null
                      }
                      onClick={() => selectTable(table.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  tone,
  dot,
}: {
  label: string;
  value: number;
  tone: "default" | "herb" | "amber" | "blue";
  dot?: boolean;
}) {
  const styles = {
    default: { bg: "bg-white", text: "text-ink-800", dotBg: "" },
    herb: { bg: "bg-white", text: "text-herb-700", dotBg: "bg-herb-500" },
    amber: { bg: "bg-white", text: "text-amber-700", dotBg: "bg-amber-500" },
    blue: { bg: "bg-white", text: "text-blue-700", dotBg: "bg-blue-500" },
  }[tone];

  return (
    <div className={cn("rounded-2xl border border-cream-200 p-4", styles.bg)}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
        {dot && (
          <span className={cn("h-2 w-2 rounded-full animate-pulse-soft", styles.dotBg)} />
        )}
        {label}
      </div>
      <div className={cn("mt-1 text-3xl font-bold tabular", styles.text)}>
        {value}
      </div>
    </div>
  );
}
