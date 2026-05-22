"use client";

import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  ShoppingBag,
  Receipt,
  ChefHat,
  Download,
  Sparkles,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { LineChart, HorizontalBars, HourlyHeatmap } from "@/components/Charts";
import {
  activeTablesNow,
  hourlySalesToday,
  monthlySalesByDay,
  pendingOrdersNow,
  todaysOrders,
  todaysRevenue,
  topMenus,
  totalCOGSThisMonth,
  totalExpensesThisMonth,
  totalOrdersThisMonth,
  totalRevenueThisMonth,
} from "@/lib/mock-data";
import { cn, formatNumber, formatPercent, formatPrice } from "@/lib/utils";

export default function DashboardPage() {
  const revenue = totalRevenueThisMonth();
  const cogs = totalCOGSThisMonth();
  const expenses = totalExpensesThisMonth();
  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - expenses;
  const grossMargin = (grossProfit / revenue) * 100;
  const netMargin = (netProfit / revenue) * 100;

  return (
    <>
      <TopBar
        title="แดชบอร์ด"
        subtitle="ภาพรวมร้านของคุณวันนี้และเดือนนี้"
        action={
          <button className="inline-flex items-center gap-2 rounded-2xl border border-cream-300 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-50">
            <Download className="h-4 w-4" />
            ดาวน์โหลดรายงาน
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Today's stat cards */}
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-bold text-ink-800">วันนี้</h2>
            <span className="flex items-center gap-1 text-xs text-herb-600">
              <span className="h-1.5 w-1.5 rounded-full bg-herb-500 animate-pulse" />
              อัปเดตเรียลไทม์
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              label="ยอดขายวันนี้"
              value={formatPrice(todaysRevenue)}
              change={12.4}
              icon={<TrendingUp className="h-5 w-5" />}
              tone="brand"
            />
            <StatCard
              label="ออเดอร์"
              value={formatNumber(todaysOrders)}
              change={8.2}
              icon={<ShoppingBag className="h-5 w-5" />}
              tone="herb"
            />
            <StatCard
              label="โต๊ะกำลังใช้"
              value={`${activeTablesNow}/20`}
              icon={<Users className="h-5 w-5" />}
              tone="blue"
            />
            <StatCard
              label="ออเดอร์รอครัว"
              value={String(pendingOrdersNow)}
              icon={<ChefHat className="h-5 w-5" />}
              tone="amber"
              pulse
            />
          </div>
        </section>

        {/* Sales chart */}
        <section className="rounded-3xl bg-white p-5 shadow-soft border border-cream-200">
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-base font-bold text-ink-800">
                ยอดขายเดือนนี้
              </h3>
              <p className="mt-0.5 text-xs text-ink-400">
                รวม {formatPrice(revenue)} จาก {formatNumber(totalOrdersThisMonth())} ออเดอร์
              </p>
            </div>
            <div className="flex gap-1">
              <button className="rounded-full bg-ink-800 px-3 py-1 text-[11px] font-semibold text-white">
                เดือนนี้
              </button>
              <button className="rounded-full bg-cream-100 px-3 py-1 text-[11px] font-medium text-ink-500 hover:bg-cream-200">
                7 วัน
              </button>
              <button className="rounded-full bg-cream-100 px-3 py-1 text-[11px] font-medium text-ink-500 hover:bg-cream-200">
                ปีนี้
              </button>
            </div>
          </div>
          <div className="mt-3">
            <LineChart
              data={monthlySalesByDay.map((d) => ({ x: d.day, y: d.revenue }))}
              height={240}
              yFormat={(n) => `฿${n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n}`}
              xLabel={(d) => `${d}`}
            />
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* P&L summary */}
          <section className="rounded-3xl bg-white p-5 shadow-soft border border-cream-200">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-bold text-ink-800">
                สรุปกำไรขาดทุน
              </h3>
              <span className="text-xs text-ink-400">เดือนนี้</span>
            </div>
            <div className="mt-4 space-y-3">
              <PLRow
                label="รายได้ (Revenue)"
                value={revenue}
                strong
                positive
              />
              <PLRow label="− ต้นทุนวัตถุดิบ (COGS)" value={-cogs} />
              <div className="border-t border-dashed border-cream-300 pt-3">
                <PLRow
                  label="กำไรขั้นต้น (Gross Profit)"
                  value={grossProfit}
                  strong
                  positive
                  meta={`Margin ${formatPercent(grossMargin)}`}
                />
              </div>
              <PLRow label="− ค่าใช้จ่ายดำเนินงาน" value={-expenses} />
              <div className="border-t-2 border-cream-300 pt-3">
                <PLRow
                  label="กำไรสุทธิ (Net Profit)"
                  value={netProfit}
                  strong
                  positive={netProfit >= 0}
                  big
                  meta={`Margin ${formatPercent(netMargin)}`}
                />
              </div>
            </div>
          </section>

          {/* Top menus */}
          <section className="rounded-3xl bg-white p-5 shadow-soft border border-cream-200">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-bold text-ink-800">
                เมนูขายดี
              </h3>
              <span className="text-xs text-ink-400">เดือนนี้ Top 5</span>
            </div>
            <div className="mt-4">
              <HorizontalBars
                data={topMenus(5).map((m) => ({
                  label: m.name,
                  value: m.soldCount,
                  sub: formatPrice(m.price * m.soldCount),
                }))}
              />
            </div>
          </section>
        </div>

        {/* Hourly heatmap */}
        <section className="rounded-3xl bg-white p-5 shadow-soft border border-cream-200">
          <div className="flex items-baseline justify-between">
            <h3 className="text-base font-bold text-ink-800">
              ช่วงเวลาขายดี
            </h3>
            <span className="text-xs text-ink-400">รายชั่วโมง · วันนี้</span>
          </div>
          <div className="mt-4">
            <HourlyHeatmap data={hourlySalesToday} />
            <div className="mt-3 flex items-center justify-between text-[10px] text-ink-400">
              <span>0:00</span>
              <span className="tabular">12:00</span>
              <span>23:00</span>
            </div>
            <div className="mt-2 flex items-center justify-end gap-2 text-[10px] text-ink-500">
              <span>ขายน้อย</span>
              <div className="flex gap-0.5">
                {[0.15, 0.35, 0.55, 0.75, 1].map((o) => (
                  <div
                    key={o}
                    className="h-3 w-3 rounded-sm"
                    style={{ background: `rgba(242,84,45,${o})` }}
                  />
                ))}
              </div>
              <span>ขายดี</span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  change,
  icon,
  tone,
  pulse,
}: {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  tone: "brand" | "herb" | "blue" | "amber";
  pulse?: boolean;
}) {
  const styles = {
    brand: { iconBg: "bg-brand-100 text-brand-700" },
    herb: { iconBg: "bg-herb-100 text-herb-700" },
    blue: { iconBg: "bg-blue-100 text-blue-700" },
    amber: { iconBg: "bg-amber-100 text-amber-700" },
  }[tone];

  return (
    <div className="rounded-2xl border border-cream-200 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            styles.iconBg,
            pulse && "animate-pulse",
          )}
        >
          {icon}
        </div>
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              change >= 0
                ? "bg-herb-50 text-herb-700"
                : "bg-red-50 text-red-700",
            )}
          >
            {change >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-3 text-xs text-ink-500">{label}</div>
      <div className="mt-0.5 text-2xl font-bold text-ink-800 tabular">
        {value}
      </div>
    </div>
  );
}

function PLRow({
  label,
  value,
  strong,
  positive,
  big,
  meta,
}: {
  label: string;
  value: number;
  strong?: boolean;
  positive?: boolean;
  big?: boolean;
  meta?: string;
}) {
  const formatted = formatPrice(Math.abs(value));
  return (
    <div className="flex items-baseline justify-between">
      <div className="flex flex-col">
        <span
          className={cn(
            "text-sm",
            strong ? "font-semibold text-ink-800" : "text-ink-500",
          )}
        >
          {label}
        </span>
        {meta && <span className="text-[10px] text-ink-400 mt-0.5">{meta}</span>}
      </div>
      <span
        className={cn(
          "tabular",
          big ? "text-2xl" : "text-base",
          strong ? "font-bold" : "font-medium",
          value < 0
            ? "text-red-600"
            : strong && positive
              ? "text-herb-700"
              : "text-ink-800",
        )}
      >
        {value < 0 ? "−" : ""}
        {formatted}
      </span>
    </div>
  );
}
