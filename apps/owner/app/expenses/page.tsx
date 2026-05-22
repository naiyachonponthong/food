"use client";

import { useMemo, useState } from "react";
import { Plus, Wallet, Calendar } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import {
  expenseCategories,
  expenses as initial,
  expensesByCategory,
} from "@/lib/mock-data";
import { ExpenseIcon } from "@/components/Icons";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export default function ExpensesPage() {
  const [list] = useState(initial);
  const total = list.reduce((s, e) => s + e.amount, 0);
  const byCat = useMemo(() => expensesByCategory(), []);

  return (
    <>
      <TopBar
        title="ค่าใช้จ่าย"
        subtitle={`เดือนนี้ · ${list.length} รายการ`}
        action={
          <button className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-pop hover:bg-brand-600">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            บันทึกค่าใช้จ่าย
          </button>
        }
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr]">
          <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white shadow-pop">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Wallet className="h-5 w-5" />
              </div>
              <Calendar className="h-4 w-4 opacity-60" />
            </div>
            <div className="mt-6 text-xs opacity-80">รวมค่าใช้จ่ายเดือนนี้</div>
            <div className="mt-1 font-display text-3xl font-bold tabular">
              {formatPrice(total)}
            </div>
            <div className="mt-3 text-xs opacity-80">
              เฉลี่ย {formatPrice(Math.round(total / new Date().getDate()))}/วัน
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-soft border border-cream-200">
            <h3 className="text-base font-bold text-ink-800">
              แยกตามหมวดหมู่
            </h3>
            <div className="mt-3 space-y-2.5">
              {byCat.map((c) => {
                const pct = (c.amount / total) * 100;
                return (
                  <div key={c.categoryId}>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ExpenseIcon id={c.icon} size="sm" />
                        <span className="text-sm font-medium text-ink-800">
                          {c.name}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] text-ink-400 tabular">
                          {pct.toFixed(1)}%
                        </span>
                        <span className="text-sm font-bold tabular text-ink-800">
                          {formatPrice(c.amount)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-cream-100">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent entries */}
        <section>
          <h2 className="mb-3 text-base font-bold text-ink-800">รายการล่าสุด</h2>
          <div className="rounded-2xl border border-cream-200 bg-white shadow-soft overflow-hidden">
            <div className="grid grid-cols-[40px_1fr_140px_120px] items-center gap-4 border-b border-cream-200 bg-cream-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              <div></div>
              <div>รายการ</div>
              <div>วันที่</div>
              <div className="text-right">จำนวนเงิน</div>
            </div>
            <ul className="divide-y divide-cream-100">
              {[...list]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .map((e) => {
                  const cat = expenseCategories.find((c) => c.id === e.categoryId);
                  return (
                    <li
                      key={e.id}
                      className="grid grid-cols-[40px_1fr_140px_120px] items-center gap-4 px-5 py-3 hover:bg-cream-50"
                    >
                      <ExpenseIcon id={cat?.icon ?? "other"} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-ink-800">
                            {cat?.name}
                          </span>
                          <span className="text-[10px] text-ink-400">
                            โดย {e.createdBy}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-ink-500">
                          {e.note}
                        </div>
                      </div>
                      <div className="text-sm text-ink-600 tabular">
                        {formatDate(e.date)}
                      </div>
                      <div className="text-right text-sm font-bold text-ink-800 tabular">
                        {formatPrice(e.amount)}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
