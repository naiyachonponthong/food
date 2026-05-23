"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  QrCode,
  CreditCard,
  Receipt,
  Printer,
  Sparkles,
  Users,
  Baby,
  Clock,
  CalendarPlus,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { usePosStore } from "@/lib/pos-store";
import { cn, formatDuration, formatPrice, formatTime } from "@/lib/utils";

type Method = "cash" | "qr" | "card";

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

  const cashNum = Number.parseFloat(cashReceived) || 0;
  const change = Math.max(0, cashNum - session.totalAmount);
  const enough = cashNum >= session.totalAmount;

  const handlePay = () => {
    setDone(true);
    setTimeout(() => {
      markPaid(session.id);
      router.push("/payments");
    }, 1800);
  };

  return (
    <>
      {/* Top header bar */}
      <header className="flex items-center justify-between gap-4 border-b border-cream-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/payments")}
            aria-label="ย้อนกลับ"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cream-300 bg-white text-ink-700 hover:bg-cream-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-ink-800">
                ชำระเงิน · โต๊ะ {session.tableName}
              </h1>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-red-700">
                ยังไม่ชำระ
              </span>
            </div>
            <div
              className="mt-0.5 flex items-center gap-3 text-xs text-ink-500"
              suppressHydrationWarning
            >
              <span>Session: {session.id.toUpperCase()}</span>
              <span>·</span>
              <span>เปิดเมื่อ {formatTime(session.openedAt)}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(Date.now() - session.openedAt)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {done ? (
          <SuccessOverlay total={session.totalAmount} method={method} />
        ) : (
          <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_440px]">
            {/* Left column: order rounds */}
            <div className="overflow-y-auto p-6 space-y-4">
              {/* Buffet pricing breakdown */}
              {session.isBuffet && (
                <section className="overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 shadow-soft">
                  <header className="flex items-center gap-2 border-b border-amber-200/60 bg-amber-100/40 px-5 py-3">
                    <Sparkles className="h-4 w-4 text-amber-700" />
                    <span className="text-sm font-bold text-amber-900">
                      บิลนี้เป็น บุฟเฟ่ต์
                    </span>
                    <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      {session.packageName}
                    </span>
                    <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      รวม {session.packageRounds} รอบสั่ง
                    </span>
                  </header>
                  <div className="px-5 py-4 space-y-2 text-sm">
                    <BuffetLine
                      icon={<Users className="h-4 w-4 text-amber-700" />}
                      label={`ผู้ใหญ่ ${session.guestAdult} คน × ${formatPrice(
                        session.priceAdult ?? 0,
                      )}`}
                      value={(session.guestAdult ?? 0) * (session.priceAdult ?? 0)}
                    />
                    <BuffetLine
                      icon={<Baby className="h-4 w-4 text-amber-700" />}
                      label={`เด็ก ${session.guestChild} คน × ${formatPrice(
                        session.priceChild ?? 0,
                      )}`}
                      value={(session.guestChild ?? 0) * (session.priceChild ?? 0)}
                    />
                    {(session.addonCharge ?? 0) > 0 && (
                      <BuffetLine
                        icon={<Plus className="h-4 w-4 text-rose-600" />}
                        label="ค่า Add-on (เมนูคิดเงินเพิ่ม)"
                        value={session.addonCharge ?? 0}
                      />
                    )}
                    {(session.extensionCharge ?? 0) > 0 && (
                      <BuffetLine
                        icon={<CalendarPlus className="h-4 w-4 text-violet-600" />}
                        label="ค่าต่อเวลา"
                        value={session.extensionCharge ?? 0}
                      />
                    )}
                  </div>
                </section>
              )}

              {/* Order rounds */}
              <section className="space-y-3">
                {sessionOrders.map((order) => (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-soft border border-cream-200"
                  >
                    <header className="flex items-center justify-between border-b border-cream-200 bg-cream-50 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-700">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-ink-500">
                          รอบ {order.roundNumber}
                        </span>
                      </div>
                      <span className="text-[10px] tabular text-ink-400">
                        {formatTime(order.placedAt)}
                      </span>
                    </header>
                    <table className="w-full text-sm">
                      <thead className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                        <tr className="border-b border-cream-100">
                          <th className="px-4 py-2 text-left">รายการ</th>
                          <th className="px-4 py-2 text-center w-16">จำนวน</th>
                          <th className="px-4 py-2 text-right w-24">ราคา</th>
                          <th className="px-4 py-2 text-right w-24">รวม</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-100">
                        {order.items.map((it) => {
                          // Buffet: in-package items don't charge
                          const charged = !session.isBuffet;
                          const unit = charged ? it.price : 0;
                          return (
                            <tr key={it.id}>
                              <td className="px-4 py-2.5">
                                <div className="font-medium text-ink-800">
                                  {it.name}
                                </div>
                                {it.note && (
                                  <div className="text-[10px] text-amber-700 italic">
                                    {it.note}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-center tabular">
                                {it.quantity}
                              </td>
                              <td className="px-4 py-2.5 text-right tabular text-ink-600">
                                {formatPrice(unit)}
                              </td>
                              <td className="px-4 py-2.5 text-right tabular font-semibold text-ink-800">
                                {formatPrice(unit * it.quantity)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </section>
            </div>

            {/* Right column: payment panel */}
            <aside className="overflow-y-auto border-l border-cream-200 bg-cream-50 p-6">
              {/* Total card */}
              <div className="rounded-3xl border border-cream-200 bg-white p-5 shadow-soft">
                <div className="flex items-baseline justify-between text-xs text-ink-500">
                  <span>ยอดรวม</span>
                  <div className="flex items-center gap-1.5">
                    <Receipt className="h-3 w-3" />
                    <span>โต๊ะ {session.tableName}</span>
                  </div>
                </div>
                <div className="mt-1 font-display text-5xl font-bold text-ink-800 tabular">
                  {formatPrice(session.totalAmount)}
                </div>
                {session.isBuffet && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      <Sparkles className="h-2.5 w-2.5" />
                      บุฟเฟ่ต์
                    </span>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                      ยังไม่ชำระ
                    </span>
                  </div>
                )}
              </div>

              {/* Method picker */}
              <div className="mt-4">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                  วิธีชำระ
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <MethodCard
                    active={method === "qr"}
                    onClick={() => setMethod("qr")}
                    icon={<QrCode className="h-5 w-5" />}
                    label="สแกนจ่าย"
                  />
                  <MethodCard
                    active={method === "cash"}
                    onClick={() => setMethod("cash")}
                    icon={<Banknote className="h-5 w-5" />}
                    label="เงินสด"
                  />
                  <MethodCard
                    active={method === "card"}
                    onClick={() => setMethod("card")}
                    icon={<CreditCard className="h-5 w-5" />}
                    label="บัตร"
                  />
                </div>
              </div>

              {method === "qr" && (
                <div className="mt-4 rounded-3xl border border-cream-200 bg-white p-4 shadow-soft">
                  <div className="rounded-2xl bg-gradient-to-b from-[#003876] to-[#0A4A8B] px-3 py-2 text-center text-white">
                    <div className="text-[9px] tracking-wide opacity-80">
                      THAI QR PAYMENT
                    </div>
                    <div className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5">
                      <span className="text-[10px] font-bold text-[#003876]">
                        PromptPay
                      </span>
                      <span className="text-[8px] text-[#003876]">พร้อมเพย์</span>
                    </div>
                  </div>
                  <div className="mt-3 aspect-square w-full max-w-[260px] mx-auto">
                    <FakeQR seed={session.id} />
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-[10px] text-ink-400">ยอดต้องชำระ</div>
                    <div className="text-2xl font-bold text-ink-800 tabular">
                      {formatPrice(session.totalAmount)}
                    </div>
                  </div>
                  <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-cream-300 bg-white py-2 text-xs font-semibold text-ink-700 hover:bg-cream-50">
                    <Printer className="h-3.5 w-3.5" />
                    พิมพ์ QR
                  </button>
                </div>
              )}

              {method === "cash" && (
                <div className="mt-4 rounded-3xl border border-cream-200 bg-white p-5 shadow-soft">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    เงินที่รับ (บาท)
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border-2 border-cream-200 bg-cream-50 px-3 py-2.5 focus-within:border-brand-400">
                    <Banknote className="h-5 w-5 text-ink-400" />
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent text-xl font-semibold tabular outline-none placeholder:text-ink-300"
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {[100, 500, 1000].map((v) => (
                      <button
                        key={v}
                        onClick={() => setCashReceived(String(v))}
                        className="rounded-xl border border-cream-300 bg-white py-2 text-xs font-semibold text-ink-700 hover:bg-cream-50"
                      >
                        ฿{v}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCashReceived(String(session.totalAmount))
                      }
                      className="col-span-3 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 py-2 text-xs font-semibold text-brand-700"
                    >
                      พอดี ({formatPrice(session.totalAmount)})
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-2xl bg-cream-50 px-4 py-3">
                    <span className="text-xs text-ink-500">เงินทอน</span>
                    <span
                      className={cn(
                        "tabular text-xl font-bold",
                        enough ? "text-herb-700" : "text-ink-300",
                      )}
                    >
                      {formatPrice(change)}
                    </span>
                  </div>
                </div>
              )}

              {method === "card" && (
                <div className="mt-4 rounded-3xl border border-cream-200 bg-white p-6 text-center text-sm text-ink-500 shadow-soft">
                  <CreditCard className="mx-auto h-10 w-10 text-ink-400" />
                  <div className="mt-3 font-semibold text-ink-800">
                    กรุณารูดบัตรที่เครื่อง EDC
                  </div>
                  <div className="mt-1 text-xs">
                    ยอดต้องชำระ {formatPrice(session.totalAmount)}
                  </div>
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={method === "cash" && !enough}
                className={cn(
                  "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white",
                  method === "cash" && !enough
                    ? "bg-ink-200"
                    : "bg-brand-500 shadow-pop hover:bg-brand-600",
                )}
              >
                <CheckCircle2 className="h-5 w-5" />
                ชำระเงิน &amp; เปิดใบเสร็จ
              </button>

              <button
                onClick={() => router.push("/payments")}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-cream-300 bg-white py-3 text-xs font-medium text-ink-600 hover:bg-cream-100"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                กลับหน้าเลือกโต๊ะ
              </button>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

function MethodCard({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all",
        active
          ? "border-brand-500 bg-brand-50/40 shadow-soft"
          : "border-cream-200 bg-white hover:border-cream-300",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          active
            ? "bg-brand-500 text-white shadow-pop"
            : "bg-cream-100 text-ink-600",
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "text-xs font-semibold",
          active ? "text-brand-700" : "text-ink-600",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function BuffetLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-ink-700">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-ink-800 tabular">
        = {formatPrice(value)}
      </span>
    </div>
  );
}

function SuccessOverlay({
  total,
  method,
}: {
  total: number;
  method: Method;
}) {
  const label =
    method === "cash"
      ? "เงินสด"
      : method === "qr"
        ? "QR PromptPay"
        : "บัตร";
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-herb-100">
        <CheckCircle2
          className="h-14 w-14 text-herb-600"
          strokeWidth={2}
        />
      </div>
      <h2 className="mt-5 text-3xl font-bold text-ink-800">ชำระเงินสำเร็จ</h2>
      <p className="mt-1 text-sm text-ink-500">
        ชำระโดย {label} · จำนวน {formatPrice(total)}
      </p>
      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-cream-100 px-4 py-2 text-xs text-ink-500">
        <Printer className="h-3.5 w-3.5" />
        กำลังพิมพ์ใบเสร็จ...
      </div>
    </div>
  );
}

function FakeQR({ seed }: { seed: string }) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const size = 27;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    s = (s * 9301 + 49297) % 233280;
    cells.push(s % 2 === 0);
  }
  const isFinder = (r: number, c: number) => {
    const inSq = (rs: number, cs: number) =>
      r >= rs && r < rs + 7 && c >= cs && c < cs + 7;
    if (inSq(0, 0) || inSq(0, size - 7) || inSq(size - 7, 0)) {
      const [fy, fx] = inSq(0, 0)
        ? [r, c]
        : inSq(0, size - 7)
          ? [r, c - (size - 7)]
          : [r - (size - 7), c];
      const inside = fy === 0 || fy === 6 || fx === 0 || fx === 6;
      const center = fy >= 2 && fy <= 4 && fx >= 2 && fx <= 4;
      return inside || center;
    }
    return null;
  };
  return (
    <div
      className="grid h-full w-full gap-px overflow-hidden rounded-md bg-white"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {Array.from({ length: size * size }).map((_, idx) => {
        const r = Math.floor(idx / size);
        const c = idx % size;
        const finder = isFinder(r, c);
        const dark = finder === null ? cells[idx] : finder === true;
        return (
          <div
            key={idx}
            className={dark ? "bg-ink-800" : "bg-white"}
            style={{ aspectRatio: "1 / 1" }}
          />
        );
      })}
    </div>
  );
}
