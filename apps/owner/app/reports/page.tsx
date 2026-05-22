"use client";

import {
  Download,
  Printer,
  TrendingUp,
  Coins,
  Receipt,
  Calculator,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { LineChart, HorizontalBars } from "@/components/Charts";
import {
  expensesByCategory,
  monthlySalesByDay,
  revenueByCategory,
  topMenus,
  totalCOGSThisMonth,
  totalExpensesThisMonth,
  totalRevenueThisMonth,
} from "@/lib/mock-data";
import { cn, formatPercent, formatPrice } from "@/lib/utils";

export default function ReportsPage() {
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
        title="งบกำไรขาดทุน (P&L)"
        subtitle={`รายงานเดือน ${new Date().toLocaleDateString("th-TH", {
          month: "long",
          year: "numeric",
        })}`}
        action={
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-cream-300 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-50">
              <Printer className="h-4 w-4" />
              พิมพ์
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-ink-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-900">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Summary grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="รายได้"
            sub="Revenue"
            value={formatPrice(revenue)}
            icon={<TrendingUp className="h-5 w-5" />}
            tone="brand"
          />
          <Metric
            label="ต้นทุนวัตถุดิบ"
            sub="COGS"
            value={formatPrice(cogs)}
            icon={<Coins className="h-5 w-5" />}
            tone="amber"
          />
          <Metric
            label="ค่าใช้จ่ายดำเนินงาน"
            sub="Operating Expenses"
            value={formatPrice(expenses)}
            icon={<Receipt className="h-5 w-5" />}
            tone="blue"
          />
          <Metric
            label="กำไรสุทธิ"
            sub={`Net Margin ${formatPercent(netMargin)}`}
            value={formatPrice(netProfit)}
            icon={<Calculator className="h-5 w-5" />}
            tone="herb"
            big
          />
        </div>

        {/* Trend */}
        <section className="rounded-3xl bg-white p-5 shadow-soft border border-cream-200">
          <h3 className="text-base font-bold text-ink-800">แนวโน้มยอดขายรายวัน</h3>
          <p className="mt-0.5 text-xs text-ink-400">
            เดือนนี้ {monthlySalesByDay.length} วัน
          </p>
          <div className="mt-3">
            <LineChart
              data={monthlySalesByDay.map((d) => ({ x: d.day, y: d.revenue }))}
              height={220}
              yFormat={(n) => `฿${n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n}`}
            />
          </div>
        </section>

        {/* P&L statement */}
        <section className="rounded-3xl bg-white p-6 shadow-soft border border-cream-200">
          <header className="border-b border-dashed border-cream-300 pb-4">
            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink-800">
                  Statement of Profit & Loss
                </h3>
                <p className="text-xs text-ink-400">งบกำไรขาดทุน — ครัวเพลิน</p>
              </div>
              <span className="text-xs text-ink-400">
                {new Date().toLocaleDateString("th-TH", { dateStyle: "medium" })}
              </span>
            </div>
          </header>

          <div className="mt-5 space-y-1.5">
            <Section title="รายได้ (Revenue)" total={revenue} positive>
              {revenueByCategory().map((c) => (
                <PLLine
                  key={c.categoryId}
                  label={c.name}
                  value={c.revenue}
                  small
                />
              ))}
            </Section>

            <Section title="ต้นทุนขาย (Cost of Goods Sold)" total={-cogs}>
              <PLLine label="ต้นทุนวัตถุดิบทั้งหมด" value={-cogs} small />
            </Section>

            <div className="mt-3 rounded-xl bg-cream-50 px-4 py-3 border-2 border-dashed border-cream-300">
              <PLLine
                label="กำไรขั้นต้น (Gross Profit)"
                value={grossProfit}
                bold
                positive
              />
              <div className="mt-1 text-[10px] text-ink-400 text-right">
                Gross Margin: {formatPercent(grossMargin)}
              </div>
            </div>

            <Section
              title="ค่าใช้จ่ายดำเนินงาน (Operating Expenses)"
              total={-expenses}
            >
              {expensesByCategory().map((e) => (
                <PLLine
                  key={e.categoryId}
                  label={`${e.icon} ${e.name}`}
                  value={-e.amount}
                  small
                />
              ))}
            </Section>

            <div className="mt-3 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/40 px-4 py-4 border-2 border-brand-200">
              <PLLine
                label="กำไรสุทธิ (Net Profit)"
                value={netProfit}
                bold
                positive={netProfit >= 0}
                big
              />
              <div className="mt-1 text-[10px] text-ink-500 text-right">
                Net Margin: {formatPercent(netMargin)}
              </div>
            </div>
          </div>
        </section>

        {/* Top categories */}
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-5 shadow-soft border border-cream-200">
            <h3 className="text-base font-bold text-ink-800">
              รายได้ตามหมวด
            </h3>
            <div className="mt-4">
              <HorizontalBars
                data={revenueByCategory()
                  .slice(0, 6)
                  .map((c) => ({
                    label: c.name,
                    value: c.revenue,
                  }))}
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-soft border border-cream-200">
            <h3 className="text-base font-bold text-ink-800">
              เมนูทำกำไรสูงสุด
            </h3>
            <p className="mt-0.5 text-xs text-ink-400">
              คำนวณจาก (ราคา − ต้นทุน) × จำนวนขาย
            </p>
            <div className="mt-4">
              <HorizontalBars
                data={topMenus(8)
                  .map((m) => ({
                    name: m.name,
                    profit: (m.price - m.cost) * m.soldCount,
                  }))
                  .sort((a, b) => b.profit - a.profit)
                  .slice(0, 6)
                  .map((m) => ({
                    label: m.name,
                    value: m.profit,
                  }))}
                color="#0FA968"
              />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function Metric({
  label,
  sub,
  value,
  icon,
  tone,
  big,
}: {
  label: string;
  sub: string;
  value: string;
  icon: React.ReactNode;
  tone: "brand" | "herb" | "blue" | "amber";
  big?: boolean;
}) {
  const styles = {
    brand: "bg-brand-100 text-brand-700",
    herb: "bg-herb-100 text-herb-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
  }[tone];

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-soft",
        big
          ? "bg-gradient-to-br from-herb-500 to-herb-700 border-herb-600 text-white"
          : "border-cream-200 bg-white",
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            big ? "bg-white/20" : styles,
          )}
        >
          {icon}
        </div>
      </div>
      <div className={cn("mt-3 text-xs", big ? "opacity-80" : "text-ink-500")}>
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 tabular font-bold",
          big ? "text-2xl" : "text-2xl",
          big ? "" : "text-ink-800",
        )}
      >
        {value}
      </div>
      <div
        className={cn(
          "mt-0.5 text-[10px]",
          big ? "opacity-80" : "text-ink-400",
        )}
      >
        {sub}
      </div>
    </div>
  );
}

function Section({
  title,
  total,
  positive,
  children,
}: {
  title: string;
  total: number;
  positive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-cream-200 pb-1.5">
        <h4 className="text-sm font-bold text-ink-800">{title}</h4>
        <span
          className={cn(
            "text-sm font-bold tabular",
            total < 0 ? "text-red-600" : positive ? "text-herb-700" : "text-ink-800",
          )}
        >
          {total < 0 ? "−" : ""}
          {formatPrice(Math.abs(total))}
        </span>
      </div>
      <div className="space-y-1 py-2 pl-3">{children}</div>
    </div>
  );
}

function PLLine({
  label,
  value,
  bold,
  positive,
  big,
  small,
}: {
  label: string;
  value: number;
  bold?: boolean;
  positive?: boolean;
  big?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span
        className={cn(
          bold ? "font-semibold text-ink-800" : small ? "text-xs text-ink-500" : "text-sm text-ink-600",
          big && "text-base",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "tabular",
          bold ? "font-bold" : "",
          big ? "text-2xl" : small ? "text-xs" : "text-sm",
          value < 0 ? "text-red-600" : bold && positive ? "text-herb-700" : "text-ink-800",
        )}
      >
        {value < 0 ? "−" : ""}
        {formatPrice(Math.abs(value))}
      </span>
    </div>
  );
}
