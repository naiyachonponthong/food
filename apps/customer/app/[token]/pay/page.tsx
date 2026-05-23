"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Banknote,
  Receipt,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, calcLineSubtotal } from "@/lib/cart-store";
import { restaurant, session } from "@/lib/mock-data";
import { cn, formatPrice } from "@/lib/utils";

export default function PayPage() {
  const params = useParams<{ token: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const method = (search.get("method") || "qr_promptpay") as
    | "qr_promptpay"
    | "cash"
    | "credit_card"
    | "slip";
  const orders = useCartStore((s) => s.orders);
  const resetBill = useCartStore((s) => s.resetBill);

  const total = useMemo(() => {
    const subtotal = orders
      .flatMap((o) => o.items)
      .reduce((s, it) => s + calcLineSubtotal(it), 0);
    const service = (subtotal * restaurant.serviceCharge) / 100;
    const vat = restaurant.hasVat
      ? ((subtotal + service) * restaurant.vatRate) / 100
      : 0;
    return { subtotal, service, vat, total: subtotal + service + vat };
  }, [orders]);

  const [step, setStep] = useState<"pending" | "verifying" | "paid">("pending");
  const [seconds, setSeconds] = useState(597); // 9:57

  // Demo: countdown
  useEffect(() => {
    if (step !== "pending") return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [step]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const receiptNumber = useMemo(
    () =>
      `${new Date()
        .toISOString()
        .replace(/[-T:.Z]/g, "")
        .slice(0, 14)}AIN`,
    [],
  );

  const handleCheckPayment = () => {
    setStep("verifying");
    setTimeout(() => setStep("paid"), 1400);
  };

  return (
    <main className="min-h-screen bg-cream-100 pb-12">
      <Header back={step === "pending"} title={method === "cash" ? "ชำระด้วยเงินสด" : "ชำระด้วย QR Code"} />

      <AnimatePresence mode="wait">
        {step !== "paid" ? (
          <motion.div
            key="pay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pt-3"
          >
            {method === "qr_promptpay" || method === "slip" ? (
              <QRSection
                amount={total.total}
                mm={mm}
                ss={ss}
                onVerify={handleCheckPayment}
                verifying={step === "verifying"}
                slipMode={method === "slip"}
              />
            ) : (
              <CashCounterInfo amount={total.total} method={method} />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 pt-6"
          >
            <PaymentSuccess
              total={total}
              receiptNumber={receiptNumber}
              onDone={() => {
                resetBill();
                router.push(`/${params.token}`);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function QRSection({
  amount,
  mm,
  ss,
  onVerify,
  verifying,
  slipMode,
}: {
  amount: number;
  mm: string;
  ss: string;
  onVerify: () => void;
  verifying: boolean;
  slipMode: boolean;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft">
      <p className="text-center text-sm text-ink-500">
        กรุณาสแกน QR Code เพื่อชำระเงิน
      </p>

      <div className="mx-auto mt-3 max-w-xs rounded-3xl border-2 border-cream-300 bg-white p-4">
        <div className="rounded-2xl bg-gradient-to-b from-[#003876] to-[#0A4A8B] px-3 py-2 text-center text-white">
          <div className="text-[10px] tracking-wide opacity-80">THAI QR PAYMENT</div>
          <div className="mt-0.5 inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-0.5">
            <span className="text-[10px] font-bold text-[#003876]">PromptPay</span>
            <span className="text-[8px] text-[#003876]">พร้อมเพย์</span>
          </div>
        </div>

        {/* Fake QR — checkerboard */}
        <div className="mt-3 aspect-square">
          <FakeQR amount={amount} />
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="text-[10px] text-ink-400">Account name</div>
            <div className="text-xs font-semibold text-ink-700">
              บริษัท เพลิน คิทเช่น จำกัด
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-ink-800 tabular">
              {amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-ink-400">(บาท/Baht)</div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-ink-400">
          <span suppressHydrationWarning>
            Receipt No. {String(Math.floor(amount * 1000)).slice(-12).padStart(12, "0")}AIN
          </span>
          <span className="tabular">⟳ {mm}:{ss}</span>
        </div>
      </div>

      <button className="mx-auto mt-3 flex items-center gap-1 text-xs font-medium text-brand-600">
        <Download className="h-3.5 w-3.5" />
        ดาวน์โหลด QR
      </button>

      <button
        onClick={onVerify}
        disabled={verifying}
        className={cn(
          "mt-4 w-full rounded-2xl py-4 font-semibold text-white shadow-pop transition-all",
          verifying ? "bg-ink-400" : "bg-blue-600 hover:bg-blue-700",
        )}
      >
        {verifying ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            กำลังตรวจสอบ...
          </span>
        ) : (
          "ตรวจสอบการชำระ"
        )}
      </button>

      {slipMode && (
        <div className="mt-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/40 p-3 text-center text-xs text-brand-700">
          หรืออัปโหลดสลิปการโอน — พนักงานจะตรวจสอบและยืนยันการชำระให้
        </div>
      )}
    </div>
  );
}

function CashCounterInfo({
  amount,
  method,
}: {
  amount: number;
  method: "cash" | "credit_card";
}) {
  return (
    <div className="rounded-3xl bg-white p-6 text-center shadow-soft">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        {method === "cash" ? (
          <Banknote className="h-8 w-8" />
        ) : (
          <Receipt className="h-8 w-8" />
        )}
      </div>
      <h2 className="mt-4 font-display text-xl font-bold text-ink-800">
        กรุณาชำระเงินที่เคาน์เตอร์
      </h2>
      <p className="mt-1 text-sm text-ink-400">
        พนักงานจะมารับชำระเงิน
        {method === "credit_card" ? "ด้วยบัตรเครดิต" : "เงินสด"}กับคุณ
      </p>
      <div className="mt-5 rounded-2xl bg-cream-100 px-4 py-4">
        <div className="text-xs text-ink-400">ยอดที่ต้องชำระ</div>
        <div className="font-display text-3xl font-bold text-brand-600 tabular">
          {formatPrice(amount)}
        </div>
      </div>
      <div className="mt-4 text-xs text-ink-400">
        โต๊ะ {session.tableName} · {session.guestName}
      </div>
    </div>
  );
}

function PaymentSuccess({
  total,
  receiptNumber,
  onDone,
}: {
  total: { subtotal: number; service: number; vat: number; total: number };
  receiptNumber: string;
  onDone: () => void;
}) {
  return (
    <div>
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-herb-100"
        >
          <CheckCircle2
            className="h-12 w-12 text-herb-600"
            strokeWidth={2.5}
            fill="none"
          />
        </motion.div>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink-800">
          ชำระเงินสำเร็จ
        </h1>
        <p className="mt-1 text-sm text-ink-400">ขอบคุณที่ใช้บริการครับ</p>
      </div>

      <div className="mt-5 rounded-3xl bg-white p-5 shadow-soft">
        <div className="text-center">
          <div className="font-display text-lg font-bold text-ink-800">
            {restaurant.name}
          </div>
          <div className="text-xs text-ink-400">{restaurant.nameEn}</div>
        </div>
        <div className="mt-3 space-y-1 text-xs text-ink-400">
          <Row label="วันที่ชำระ" value={new Date().toLocaleString("th-TH")} />
          <Row label="หมายเลขโต๊ะ" value={session.tableName} />
          <Row label="เลขที่ใบเสร็จ" value={receiptNumber} />
        </div>

        <div className="my-4 border-t-2 border-dashed border-cream-300" />

        <div className="space-y-1.5 text-sm">
          <Row label="รวม" value={formatPrice(total.subtotal)} />
          <Row
            label={`ค่าบริการ ${restaurant.serviceCharge}%`}
            value={formatPrice(total.service)}
          />
          {restaurant.hasVat && (
            <Row
              label={`ภาษี ${restaurant.vatRate}%`}
              value={formatPrice(total.vat)}
            />
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t-2 border-dashed border-cream-300 pt-3">
          <span className="text-base font-semibold text-ink-800">
            รวมทั้งหมด
          </span>
          <span className="font-display text-2xl font-bold text-brand-600 tabular">
            {formatPrice(total.total)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1 rounded-2xl bg-cream-100 px-3 py-2 text-xs text-ink-500">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" />
          ชำระเงินโดย Thai QR Payment
        </div>
      </div>

      <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink-800 py-3.5 font-semibold text-white">
        <Download className="h-4 w-4" />
        บันทึกภาพใบเสร็จ
      </button>
      <button
        onClick={onDone}
        className="mt-2 w-full rounded-2xl border-2 border-cream-300 bg-white py-3.5 font-medium text-ink-700"
      >
        เสร็จสิ้น
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-700 tabular">{value}</span>
    </div>
  );
}

function FakeQR({ amount }: { amount: number }) {
  // Generate a stable pseudo-random QR pattern based on amount.
  const seed = Math.floor(amount * 31) || 1;
  const size = 29;
  const cells: boolean[] = [];
  let s = seed;
  for (let i = 0; i < size * size; i++) {
    s = (s * 9301 + 49297) % 233280;
    cells.push(s % 2 === 0);
  }
  // Corner finders
  const isFinder = (r: number, c: number) => {
    const inSquare = (rs: number, cs: number) =>
      r >= rs && r < rs + 7 && c >= cs && c < cs + 7;
    if (inSquare(0, 0) || inSquare(0, size - 7) || inSquare(size - 7, 0)) {
      const fr = inSquare(0, 0)
        ? [r, c]
        : inSquare(0, size - 7)
          ? [r, c - (size - 7)]
          : [r - (size - 7), c];
      const [fy, fx] = fr;
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

function Header({ title, back }: { title: string; back?: boolean }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 border-b border-cream-200 bg-cream-100/95 pt-safe backdrop-blur">
      <div className="flex items-center gap-2 px-4 py-3">
        {back ? (
          <button
            onClick={() => router.back()}
            aria-label="ปิด"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft"
          >
            <ArrowLeft className="h-5 w-5 text-ink-800" />
          </button>
        ) : (
          <div className="h-10 w-10" />
        )}
        <h1 className="flex-1 text-center font-display text-lg font-bold text-ink-800">
          {title}
        </h1>
        <div className="h-10 w-10" />
      </div>
    </header>
  );
}
