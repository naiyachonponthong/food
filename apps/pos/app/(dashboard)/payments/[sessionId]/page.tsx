"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Crown,
  Calendar,
  Info,
  QrCode,
  Printer,
  CheckCircle2,
  ChevronDown,
  ShoppingCart,
  Receipt,
  FileText,
  Banknote,
  Smartphone,
  CreditCard,
} from "lucide-react";
import { usePosStore } from "@/lib/pos-store";
import {
  BRANCH_NAME,
  orderDisplayCode,
  pastPayments,
  RESTAURANT_NAME,
  sessionDisplayCode,
  tableDisplayCode,
  type PastPayment,
} from "@/lib/mock-data";
import { cn, formatPrice } from "@/lib/utils";

type Method = "qr" | "cash" | "card";

const METHOD_LABEL: Record<Method, string> = {
  qr: "สแกนจ่าย",
  cash: "เงินสด",
  card: "บัตรเครดิต",
};

function formatDT(ts: number): string {
  const d = new Date(ts);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0") +
    " " +
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0") +
    ":" +
    String(d.getSeconds()).padStart(2, "0")
  );
}

export default function CashierCheckoutPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessions = usePosStore((s) => s.sessions);
  const orders = usePosStore((s) => s.orders);
  const markPaid = usePosStore((s) => s.markBillPaid);

  const session = sessions.find((s) => s.id === params.sessionId);
  const sessionOrders = useMemo(
    () =>
      session
        ? orders
            .filter((o) => o.sessionId === session.id)
            .sort((a, b) => a.placedAt - b.placedAt)
        : [],
    [session, orders],
  );

  const [method, setMethod] = useState<Method>("qr");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [methodOpen, setMethodOpen] = useState(false);
  const [done, setDone] = useState(false);

  if (!session) {
    return (
      <main className="flex-1 p-8">
        <button
          onClick={() => router.push("/payments")}
          className="text-sm text-brand-600"
        >
          ← กลับหน้าชำระเงิน
        </button>
        <div className="mt-6 text-center text-sm text-ink-400">
          ไม่พบ session
        </div>
      </main>
    );
  }

  const tableCode = tableDisplayCode(session.tableName);
  const sessionCode = sessionDisplayCode(session.id);
  const total = session.totalAmount;
  const cashNum = Number.parseFloat(cashReceived) || 0;
  const change = Math.max(0, cashNum - total);
  const enough = method === "qr" || method === "card" || cashNum >= total;

  // For QR method, "amount received" is auto-locked to total
  const autoAmount = method === "qr" ? total : cashNum;

  const handlePay = () => {
    setDone(true);
    setTimeout(() => {
      markPaid(session.id);
      router.push("/payments");
    }, 1600);
  };

  return (
    <>
      {/* Top header bar */}
      <header className="border-b border-cream-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/payments")}
            aria-label="ย้อนกลับ"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cream-300 bg-white text-ink-700 hover:bg-cream-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-baseline gap-3">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-ink-800">
              <Receipt className="h-6 w-6 text-blue-600" />
              ชำระเงิน · โต๊ะ {tableCode}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              ยังไม่ชำระ
            </span>
          </div>
        </div>
        {/* Session sub-line */}
        <div className="ml-13 mt-2 flex flex-wrap items-center gap-3 pl-13 text-xs">
          <div className="flex items-center gap-2 text-ink-600">
            <span className="font-semibold">Session:</span>
            <span className="font-mono tabular text-ink-800">{sessionCode}</span>
          </div>
          {session.isBuffet && (
            <>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                <Crown className="h-2.5 w-2.5" />
                บุฟเฟ่ต์
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                ยังไม่ชำระ
              </span>
            </>
          )}
          <span
            className="inline-flex items-center gap-1 text-ink-500"
            suppressHydrationWarning
          >
            <Calendar className="h-3 w-3" />
            เปิดเมื่อ {formatDT(session.openedAt)}
          </span>
          {session.isBuffet && (
            <span className="text-ink-500">
              · รวม {session.packageRounds} รอบสั่ง
            </span>
          )}
        </div>
        {session.isBuffet && (
          <div className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 border border-amber-200">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span>
              บิลนี้เป็น <b>บุฟเฟ่ต์</b> (คิดค่าหัวเหมาแยก) + ค่าเพิ่มเติมที่
              เห็นรวมในยอดบิลด้วย
            </span>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto bg-cream-100">
        {done ? (
          <SuccessOverlay total={total} method={method} />
        ) : (
          <div className="grid h-full grid-cols-1 gap-5 p-6 lg:grid-cols-[1fr_440px]">
            {/* Left column: order rounds */}
            <div className="space-y-4">
              {sessionOrders.map((order) => (
                <section
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft"
                >
                  <header className="flex items-center justify-between border-b border-cream-200 bg-cream-50 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                      <span className="font-mono text-sm font-semibold text-ink-800">
                        {orderDisplayCode(order.id, order.placedAt)}
                      </span>
                    </div>
                    <span
                      className="text-xs tabular text-ink-500"
                      suppressHydrationWarning
                    >
                      {formatDT(order.placedAt)}
                    </span>
                  </header>
                  <table className="w-full text-sm">
                    <thead className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      <tr className="border-b border-cream-100">
                        <th className="px-4 py-2 text-left">รายการ</th>
                        <th className="px-4 py-2 text-center w-20">จำนวน</th>
                        <th className="px-4 py-2 text-right w-24">ราคา</th>
                        <th className="px-4 py-2 text-left w-32">หมายเหตุ</th>
                        <th className="px-4 py-2 text-right w-24">รวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100">
                      {order.items.map((it) => {
                        const charged = !session.isBuffet;
                        const unit = charged ? it.price : 0;
                        return (
                          <tr key={it.id}>
                            <td className="px-4 py-2.5 text-ink-800 font-medium">
                              {it.name}
                            </td>
                            <td className="px-4 py-2.5 text-center tabular">
                              {it.quantity}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular text-ink-600">
                              {unit.toFixed(2)}
                            </td>
                            <td className="px-4 py-2.5 text-xs text-ink-500">
                              {it.note ||
                                it.options.map((o) => o.name).join(", ")}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular font-semibold text-ink-800">
                              {(unit * it.quantity).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-cream-200 bg-cream-50/60">
                        <td colSpan={4} className="px-4 py-2.5 text-xs font-semibold text-ink-600">
                          ยอดรวมรอบนี้
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm font-bold tabular text-ink-800">
                          {(session.isBuffet
                            ? 0
                            : order.items.reduce(
                                (s, it) => s + it.price * it.quantity,
                                0,
                              )
                          ).toFixed(2)}{" "}
                          ฿
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </section>
              ))}
            </div>

            {/* Right column: payment panel */}
            <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
              {/* Total card */}
              <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                      <Receipt className="h-3.5 w-3.5" />
                      ยอดรวม
                    </div>
                    <div className="mt-1 font-display text-4xl font-bold text-ink-800 tabular">
                      {formatPrice(total)}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {session.isBuffet && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          <Crown className="h-2.5 w-2.5" />
                          บุฟเฟ่ต์
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        ยังไม่ชำระ
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-ink-400">สาขา</div>
                    <div className="font-semibold text-ink-700">
                      {BRANCH_NAME}
                    </div>
                    <div className="mt-1 text-ink-400">โต๊ะ:</div>
                    <div className="font-mono font-semibold text-ink-700">
                      {tableCode}
                    </div>
                  </div>
                </div>
                {session.isBuffet && (
                  <div className="mt-3 flex items-baseline justify-between border-t border-dashed border-cream-300 pt-2 text-xs">
                    <div className="flex items-center gap-1 text-ink-500">
                      <Crown className="h-3 w-3 text-amber-500" />
                      <span>Premium (ราคา/คน)</span>
                    </div>
                    <div className="text-ink-700 tabular">
                      ผู้ใหญ่ {session.guestAdult} คน × {session.priceAdult?.toFixed(2)}
                      {" "}={" "}
                      <span className="font-semibold">
                        {((session.guestAdult ?? 0) * (session.priceAdult ?? 0)).toFixed(2)} ฿
                      </span>
                    </div>
                  </div>
                )}
                {session.isBuffet && (session.guestChild ?? 0) > 0 && (
                  <div className="mt-1 flex items-baseline justify-between text-xs">
                    <span className="text-ink-500">&nbsp;</span>
                    <div className="text-ink-700 tabular">
                      เด็ก {session.guestChild} คน × {session.priceChild?.toFixed(2)}
                      {" "}={" "}
                      <span className="font-semibold">
                        {((session.guestChild ?? 0) * (session.priceChild ?? 0)).toFixed(2)} ฿
                      </span>
                    </div>
                  </div>
                )}
                <div className="mt-3 border-t border-dashed border-cream-300 pt-2 text-xs text-ink-500">
                  ค่าหัวเหมา: {formatPrice(total)}
                </div>
              </div>

              {/* Method dropdown */}
              <div className="rounded-2xl border border-cream-200 bg-white p-4 shadow-soft">
                <label className="block text-xs font-semibold text-ink-600 mb-2">
                  วิธีชำระ
                </label>
                <div className="relative">
                  <button
                    onClick={() => setMethodOpen((o) => !o)}
                    className="flex w-full items-center justify-between rounded-xl border-2 border-cream-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-ink-800 hover:border-cream-300"
                  >
                    <span className="flex items-center gap-2">
                      {method === "qr" && <Smartphone className="h-4 w-4 text-blue-600" />}
                      {method === "cash" && <Banknote className="h-4 w-4 text-emerald-600" />}
                      {method === "card" && <CreditCard className="h-4 w-4 text-violet-600" />}
                      {METHOD_LABEL[method]}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-ink-400 transition-transform", methodOpen && "rotate-180")} />
                  </button>
                  {methodOpen && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-cream-200 bg-white shadow-lift">
                      {(["qr", "cash", "card"] as Method[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setMethod(m);
                            setMethodOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 px-3.5 py-2.5 text-sm hover:bg-cream-50",
                            method === m && "bg-brand-50 font-semibold text-brand-700",
                          )}
                        >
                          {m === "qr" && <Smartphone className="h-4 w-4 text-blue-600" />}
                          {m === "cash" && <Banknote className="h-4 w-4 text-emerald-600" />}
                          {m === "card" && <CreditCard className="h-4 w-4 text-violet-600" />}
                          {METHOD_LABEL[m]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {method === "qr" && (
                  <>
                    <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-ink-800 px-4 py-3 text-sm font-bold text-white shadow-pop hover:bg-ink-900">
                      <QrCode className="h-4 w-4" />
                      แสดง QR พร้อมเพย์ (ยอด {total.toFixed(2)})
                    </button>
                    <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
                      QR จะถูกออกอัตโนมัติ และสามารถกดพิมพ์ออกเครื่อง POS ได้
                    </p>
                  </>
                )}
              </div>

              {/* Cash received */}
              <div className="rounded-2xl border border-cream-200 bg-white p-4 shadow-soft">
                <label className="block text-xs font-semibold text-ink-600 mb-1.5">
                  ยอดเงินที่รับ
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={method === "qr" ? total.toFixed(2) : cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  disabled={method === "qr"}
                  placeholder="0.00"
                  className={cn(
                    "w-full rounded-xl border-2 px-3.5 py-2.5 text-lg font-bold tabular outline-none",
                    method === "qr"
                      ? "border-cream-200 bg-cream-50 text-ink-700"
                      : "border-cream-200 bg-white text-ink-800 focus:border-brand-400",
                  )}
                />
                {method === "qr" ? (
                  <p className="mt-1.5 text-[11px] text-ink-500">
                    เลือก &ldquo;สแกนจ่าย&rdquo; จะถูกล็อกยอดให้เท่ากับยอดบุฟเฟ่ต์อัตโนมัติ
                  </p>
                ) : (
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {[100, 500, 1000].map((v) => (
                      <button
                        key={v}
                        onClick={() => setCashReceived(String(v))}
                        className="rounded-lg border border-cream-300 bg-white py-1.5 text-xs font-semibold text-ink-700 hover:bg-cream-50"
                      >
                        ฿{v}
                      </button>
                    ))}
                    <button
                      onClick={() => setCashReceived(total.toFixed(2))}
                      className="rounded-lg border border-dashed border-brand-300 bg-brand-50/50 py-1.5 text-xs font-semibold text-brand-700"
                    >
                      พอดี
                    </button>
                  </div>
                )}
              </div>

              {/* Change */}
              <div className="rounded-2xl border border-cream-200 bg-white p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink-600">
                    เงินทอน
                  </label>
                  <span
                    className={cn(
                      "text-2xl font-bold tabular",
                      enough && change > 0 ? "text-emerald-600" : "text-ink-400",
                    )}
                  >
                    {(method === "qr" ? 0 : change).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={handlePay}
                disabled={!enough}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-pop",
                  enough
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-ink-200",
                )}
              >
                <CheckCircle2 className="h-5 w-5" />
                ชำระเงิน &amp; เปิดใบเสร็จ
              </button>
              <button
                onClick={() => router.push("/payments")}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-cream-300 bg-white py-2.5 text-xs font-medium text-ink-600 hover:bg-cream-100"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                กลับหน้าเลือกโต๊ะ
              </button>
            </aside>

            {/* Payment list (bottom, full width) */}
            <div className="lg:col-span-2">
              <PaymentList />
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function PaymentList() {
  const list = pastPayments;
  const totals = list.reduce(
    (a, p) => ({
      normal: a.normal + p.normalAmount,
      buffet: a.buffet + p.buffetAmount,
      total: a.total + p.normalAmount + p.buffetAmount,
      received: a.received + p.received,
      change: a.change + p.change,
    }),
    { normal: 0, buffet: 0, total: 0, received: 0, change: 0 },
  );

  const cashTotal = list
    .filter((p) => p.method === "cash")
    .reduce((s, p) => s + p.normalAmount + p.buffetAmount, 0);
  const qrTotal = list
    .filter((p) => p.method === "qr")
    .reduce((s, p) => s + p.normalAmount + p.buffetAmount, 0);

  return (
    <section className="rounded-2xl border border-cream-200 bg-white p-5 shadow-soft">
      <header className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-blue-600" />
        <h3 className="text-base font-bold text-ink-800">รายการชำระเงิน</h3>
      </header>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-cream-200 bg-cream-50 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            ยอดรวม (ตามช่วงที่ค้นหา)
          </div>
          <div className="mt-1 font-display text-2xl font-bold tabular text-blue-700">
            {formatPrice(totals.total, "")} ฿
          </div>
          <div className="mt-0.5 text-[11px] text-ink-500">
            จำนวนบิล: {list.length} รายการ
          </div>
        </div>
        <div className="rounded-xl border border-cream-200 bg-cream-50 p-3">
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            <Banknote className="h-3 w-3" /> เงินสด
          </div>
          <div className="mt-1 font-display text-2xl font-bold tabular text-ink-800">
            {formatPrice(cashTotal, "")} ฿
          </div>
          <div className="mt-0.5 text-[11px] text-ink-500">
            ยอดปกติ: {totals.normal.toFixed(0)} · บุฟเฟ่ต์: {totals.buffet.toFixed(0)}
          </div>
        </div>
        <div className="rounded-xl border border-cream-200 bg-cream-50 p-3">
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
            <Smartphone className="h-3 w-3" /> สแกนจ่าย
          </div>
          <div className="mt-1 font-display text-2xl font-bold tabular text-ink-800">
            {formatPrice(qrTotal, "")} ฿
          </div>
          <div className="mt-0.5 text-[11px] text-ink-500">
            ยอดปกติ: {totals.normal.toFixed(0)} · บุฟเฟ่ต์: {totals.buffet.toFixed(0)}
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b-2 border-cream-200 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              <th className="px-2 py-2 text-left">#</th>
              <th className="px-2 py-2 text-left">โต๊ะ</th>
              <th className="px-2 py-2 text-left">เวลาชำระ</th>
              <th className="px-2 py-2 text-left">ประเภท</th>
              <th className="px-2 py-2 text-left">วิธีชำระ</th>
              <th className="px-2 py-2 text-left">ผู้รับชำระ</th>
              <th className="px-2 py-2 text-right">ยอดปกติ</th>
              <th className="px-2 py-2 text-right">ยอดบุฟเฟ่ต์</th>
              <th className="px-2 py-2 text-right">ยอดชำระจริง</th>
              <th className="px-2 py-2 text-right">รับเงิน</th>
              <th className="px-2 py-2 text-right">ทอน</th>
              <th className="px-2 py-2 text-center">ปริ้น</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            {list.map((p) => (
              <PayRow key={p.id} p={p} />
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-cream-200 bg-cream-50 text-sm font-bold tabular text-ink-800">
              <td colSpan={6} className="px-2 py-2.5 text-right">
                รวมทั้งหมด ({list.length} บิล)
              </td>
              <td className="px-2 py-2.5 text-right">{totals.normal.toFixed(2)}</td>
              <td className="px-2 py-2.5 text-right">{totals.buffet.toFixed(2)}</td>
              <td className="px-2 py-2.5 text-right text-blue-700">
                {totals.total.toFixed(2)}
              </td>
              <td className="px-2 py-2.5 text-right">{totals.received.toFixed(2)}</td>
              <td className="px-2 py-2.5 text-right">{totals.change.toFixed(2)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function PayRow({ p }: { p: PastPayment }) {
  const typeBadge =
    p.type === "buffet"
      ? { label: "บุฟเฟ่ต์", className: "bg-amber-100 text-amber-700" }
      : p.type === "buffet_plus"
        ? { label: "บุฟเฟ่ต์+เพิ่มเติม", className: "bg-violet-100 text-violet-700" }
        : { label: "ปกติ", className: "bg-emerald-100 text-emerald-700" };
  const methodBadge =
    p.method === "cash"
      ? { label: "เงินสด", className: "bg-emerald-50 text-emerald-700" }
      : p.method === "qr"
        ? { label: "สแกนจ่าย", className: "bg-blue-50 text-blue-700" }
        : { label: "บัตร", className: "bg-violet-50 text-violet-700" };
  const total = p.normalAmount + p.buffetAmount;
  return (
    <tr className="hover:bg-cream-50">
      <td className="px-2 py-2 font-bold tabular text-ink-700">{p.no}</td>
      <td className="px-2 py-2">
        <span className="rounded-md bg-cream-200 px-1.5 py-0.5 font-mono text-[11px] font-bold text-ink-800">
          โต๊ะ
          <br />
          {p.tableCode}
        </span>
      </td>
      <td
        className="px-2 py-2 font-mono tabular text-[11px] text-ink-600"
        suppressHydrationWarning
      >
        {formatDT(p.paidAt)}
      </td>
      <td className="px-2 py-2">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", typeBadge.className)}>
          {typeBadge.label}
        </span>
      </td>
      <td className="px-2 py-2">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", methodBadge.className)}>
          {methodBadge.label}
        </span>
      </td>
      <td className="px-2 py-2 text-ink-600">{p.staff}</td>
      <td className="px-2 py-2 text-right tabular">{p.normalAmount.toFixed(2)}</td>
      <td className="px-2 py-2 text-right tabular">{p.buffetAmount.toFixed(2)}</td>
      <td className="px-2 py-2 text-right tabular font-bold text-blue-700">
        {total.toFixed(2)}
      </td>
      <td className="px-2 py-2 text-right tabular">{p.received.toFixed(2)}</td>
      <td className="px-2 py-2 text-right tabular">{p.change.toFixed(2)}</td>
      <td className="px-2 py-2 text-center">
        <button
          aria-label="พิมพ์"
          className="inline-flex items-center gap-1 rounded-md border border-cream-300 bg-white px-2 py-1 text-[10px] font-semibold text-ink-700 hover:bg-cream-50"
        >
          <Printer className="h-3 w-3" />
          พิมพ์
        </button>
      </td>
    </tr>
  );
}

function SuccessOverlay({
  total,
  method,
}: {
  total: number;
  method: Method;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-14 w-14 text-emerald-600" strokeWidth={2} />
      </div>
      <h2 className="mt-5 text-3xl font-bold text-ink-800">ชำระเงินสำเร็จ</h2>
      <p className="mt-1 text-sm text-ink-500">
        ชำระโดย {METHOD_LABEL[method]} · จำนวน {formatPrice(total)}
      </p>
      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-cream-100 px-4 py-2 text-xs text-ink-500">
        <Printer className="h-3.5 w-3.5" />
        กำลังพิมพ์ใบเสร็จ...
      </div>
    </div>
  );
}
