"use client";

import { useRouter } from "next/navigation";
import { Receipt, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { usePosStore } from "@/lib/pos-store";
import { cn, formatPrice, formatTime } from "@/lib/utils";

export default function PaymentsPage() {
  const sessions = usePosStore((s) => s.sessions);
  const notifications = usePosStore((s) => s.notifications);
  const markPaid = usePosStore((s) => s.markBillPaid);
  const selectTable = usePosStore((s) => s.selectTable);
  const router = useRouter();

  const billRequested = sessions.filter((s) => s.hasBillRequest);
  const paid = notifications.filter((n) => n.type === "payment-received").slice(0, 10);

  return (
    <>
      <TopBar title="ชำระเงิน" subtitle={`${billRequested.length} โต๊ะรอชำระ`} />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Bill requested */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink-800">
            <Receipt className="h-4 w-4 text-blue-600" />
            โต๊ะรอชำระเงิน
          </h2>
          {billRequested.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-cream-300 bg-white px-6 py-10 text-center text-sm text-ink-400">
              ไม่มีคำขอเช็คบิลในขณะนี้
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {billRequested.map((s) => (
                <div
                  key={s.id}
                  className="overflow-hidden rounded-2xl border-2 border-blue-200 bg-white shadow-soft"
                >
                  <div className="flex items-center justify-between bg-blue-50 px-4 py-2.5">
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold tabular text-ink-800">
                        {s.tableName}
                      </div>
                      {s.isBuffet && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                          <Sparkles className="h-2.5 w-2.5" />
                          Buffet
                        </span>
                      )}
                    </div>
                    <span className="rounded-full bg-blue-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      รอเช็คบิล
                    </span>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-ink-500">
                      <span>
                        {s.isBuffet
                          ? `${s.guestAdult} ผู้ใหญ่ · ${s.guestChild} เด็ก`
                          : `${s.guestCount} คน`}
                      </span>
                      <span>{s.itemsCount} รายการ</span>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-dashed border-cream-300 pt-2">
                      <span className="text-xs text-ink-400">ยอดรวม</span>
                      <span className="font-bold text-2xl text-ink-800 tabular">
                        {formatPrice(s.totalAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-cream-200 bg-cream-50 p-3">
                    <button
                      onClick={() => selectTable(s.tableId)}
                      className="rounded-xl border border-cream-300 bg-white py-2 text-xs font-semibold text-ink-700 hover:bg-cream-100"
                    >
                      ดูออเดอร์
                    </button>
                    <button
                      onClick={() => router.push(`/payments/${s.id}`)}
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-brand-500 py-2 text-xs font-semibold text-white shadow-pop hover:bg-brand-600"
                    >
                      รับชำระ
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent payments */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink-800">
            <CheckCircle2 className="h-4 w-4 text-herb-600" />
            ชำระเงินล่าสุด
          </h2>
          {paid.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-10 text-center text-sm text-ink-400 border border-cream-200">
              ยังไม่มีการชำระเงินวันนี้
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft">
              <ul className="divide-y divide-cream-100">
                {paid.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-4 px-5 py-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-herb-100 text-herb-700">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="rounded-md bg-cream-200 px-1.5 py-0.5 text-[10px] font-bold">
                          โต๊ะ {p.tableName}
                        </span>
                        <span className="text-sm font-semibold text-ink-800">
                          {p.title}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-ink-500">{p.body}</div>
                    </div>
                    <div className="text-right text-xs text-ink-400 tabular">
                      {formatTime(p.at)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
