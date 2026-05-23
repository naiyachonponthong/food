"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, QrCode, Banknote, CreditCard, Upload, Info } from "lucide-react";
import { useState, useMemo } from "react";
import { Sheet } from "@/components/Sheet";
import { useCartStore, calcLineSubtotal } from "@/lib/cart-store";
import { restaurant, session } from "@/lib/mock-data";
import { cn, formatPrice } from "@/lib/utils";

type PaymentMethod = "qr_promptpay" | "cash" | "credit_card" | "slip";

export default function BillPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const orders = useCartStore((s) => s.orders);
  const requestBill = useCartStore((s) => s.requestBill);

  const [method, setMethod] = useState<PaymentMethod | null>("qr_promptpay");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const summary = useMemo(() => {
    const allItems = orders.flatMap((o) => o.items);
    const subtotal = allItems.reduce(
      (s, it) => s + calcLineSubtotal(it),
      0,
    );
    const serviceCharge = (subtotal * restaurant.serviceCharge) / 100;
    const vat = restaurant.hasVat
      ? ((subtotal + serviceCharge) * restaurant.vatRate) / 100
      : 0;
    const total = subtotal + serviceCharge + vat;
    return { allItems, subtotal, serviceCharge, vat, total };
  }, [orders]);

  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-cream-100">
        <Header back title="บิลค่าอาหาร" />
        <div className="px-6 pt-20 text-center text-ink-400">
          ยังไม่มีรายการที่สั่ง
        </div>
      </main>
    );
  }

  const handleProceed = () => {
    requestBill();
    setConfirmOpen(false);
    if (method === "qr_promptpay") {
      router.push(`/${params.token}/pay`);
    } else {
      router.push(`/${params.token}/pay?method=${method}`);
    }
  };

  return (
    <main className="min-h-screen bg-cream-100 pb-32">
      <Header back title="บิลค่าอาหาร" />

      <div className="space-y-4 px-4 pt-3">
        {/* Items */}
        <section className="rounded-3xl bg-white p-5 shadow-soft">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-base font-semibold text-ink-800">
              รายการที่สั่ง ({summary.allItems.length})
            </h3>
            <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-xs font-semibold text-ink-700">
              โต๊ะ {session.tableName}
            </span>
          </div>
          <div className="mt-3 divide-y divide-cream-200">
            {summary.allItems.map((it) => (
              <div key={it.id} className="flex items-start gap-3 py-3 text-sm">
                <span className="font-bold text-ink-700 tabular">
                  {it.quantity}x
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-ink-800">{it.name}</div>
                  {it.options.length > 0 && (
                    <div className="text-xs text-ink-400">
                      {it.options.map((o) => o.choice.name).join(" · ")}
                    </div>
                  )}
                  <div className="text-[10px] text-ink-400">
                    สั่งโดย {it.orderedBy}
                  </div>
                </div>
                <span className="font-semibold text-ink-700 tabular">
                  {formatPrice(calcLineSubtotal(it))}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Summary */}
        <section className="rounded-3xl bg-white p-5 shadow-soft">
          <h3 className="font-display text-base font-semibold text-ink-800">
            สรุปยอด
          </h3>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="รวม" value={formatPrice(summary.subtotal)} />
            <Row
              label={`ค่าบริการ ${restaurant.serviceCharge}%`}
              value={formatPrice(summary.serviceCharge)}
            />
            {restaurant.hasVat && (
              <Row
                label={`ภาษี ${restaurant.vatRate}%`}
                value={formatPrice(summary.vat)}
              />
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t-2 border-dashed border-cream-300 pt-3">
            <span className="text-base font-semibold text-ink-800">
              ราคารวม
            </span>
            <span className="font-display text-2xl font-bold text-brand-600 tabular">
              {formatPrice(summary.total)}
            </span>
          </div>
        </section>

        {/* Payment methods */}
        <section className="rounded-3xl bg-white p-5 shadow-soft">
          <h3 className="font-display text-base font-semibold text-ink-800">
            วิธีการชำระเงิน
          </h3>
          <div className="mt-2 flex items-start gap-2 rounded-2xl bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              ชำระเงินค่าอาหาร เมื่อคุณทานเสร็จเรียบร้อยแล้วเท่านั้น
            </span>
          </div>
          <div className="mt-3 space-y-2">
            <PaymentOption
              id="qr_promptpay"
              icon={<QrCode className="h-5 w-5" />}
              label="QR PromptPay"
              description="สแกนจ่ายผ่านแอปธนาคาร"
              recommended
              selected={method === "qr_promptpay"}
              onSelect={setMethod}
            />
            <PaymentOption
              id="slip"
              icon={<Upload className="h-5 w-5" />}
              label="แนบสลิปการโอน"
              description="โอนแล้วอัปโหลดสลิป"
              selected={method === "slip"}
              onSelect={setMethod}
            />
            <PaymentOption
              id="cash"
              icon={<Banknote className="h-5 w-5" />}
              label="เงินสด"
              description="ชำระที่เคาน์เตอร์"
              selected={method === "cash"}
              onSelect={setMethod}
            />
            <PaymentOption
              id="credit_card"
              icon={<CreditCard className="h-5 w-5" />}
              label="บัตรเครดิต"
              description="ชำระที่เคาน์เตอร์"
              selected={method === "credit_card"}
              onSelect={setMethod}
            />
          </div>
        </section>
      </div>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 pb-safe">
        <div className="mx-auto max-w-md border-t border-cream-200 bg-white/95 px-4 py-3 backdrop-blur">
          <button
            disabled={!method}
            onClick={() => setConfirmOpen(true)}
            className={cn(
              "w-full rounded-2xl py-4 font-semibold text-white",
              method ? "bg-blue-600 shadow-pop" : "bg-ink-200",
            )}
          >
            ดำเนินการต่อ
          </button>
        </div>
      </div>

      {/* Confirm sheet */}
      <Sheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="ยืนยันการเรียกเช็คบิล"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className="flex-1 rounded-2xl border-2 border-cream-300 bg-white py-3.5 font-semibold text-ink-700"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleProceed}
              className="flex-1 rounded-2xl bg-blue-600 py-3.5 font-semibold text-white shadow-pop"
            >
              ยืนยัน
            </button>
          </div>
        }
      >
        <div className="rounded-2xl bg-brand-50 p-4 text-center text-sm text-brand-800">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 text-white">
            <Info className="h-5 w-5" strokeWidth={2} />
          </div>
          <span className="font-semibold">โปรดทราบ</span>
          <div className="mt-1 text-xs">
            หากเรียกเช็คบิลแล้ว คุณจะไม่สามารถสั่งอาหารต่อได้
          </div>
        </div>
      </Sheet>
    </main>
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

function PaymentOption({
  id,
  icon,
  label,
  description,
  recommended,
  selected,
  onSelect,
}: {
  id: PaymentMethod;
  icon: React.ReactNode;
  label: string;
  description: string;
  recommended?: boolean;
  selected: boolean;
  onSelect: (id: PaymentMethod) => void;
}) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border-2 bg-white p-3.5 text-left transition-all",
        selected
          ? "border-brand-500 bg-brand-50/40 shadow-soft"
          : "border-cream-200 hover:border-cream-300",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl",
          selected ? "bg-brand-500 text-white" : "bg-cream-100 text-ink-600",
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-ink-800">{label}</span>
          {recommended && (
            <span className="rounded-full bg-herb-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-herb-700">
              แนะนำ
            </span>
          )}
        </div>
        <div className="text-xs text-ink-400">{description}</div>
      </div>
      <div
        className={cn(
          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2",
          selected
            ? "border-brand-500 bg-brand-500"
            : "border-cream-300 bg-white",
        )}
      >
        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}

function Header({ title, back }: { title: string; back?: boolean }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 border-b border-cream-200 bg-cream-100/95 pt-safe backdrop-blur">
      <div className="flex items-center gap-2 px-4 py-3">
        {back && (
          <button
            onClick={() => router.back()}
            aria-label="ย้อนกลับ"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft"
          >
            <ArrowLeft className="h-5 w-5 text-ink-800" />
          </button>
        )}
        <h1 className="flex-1 text-center font-display text-lg font-bold text-ink-800">
          {title}
        </h1>
        <div className="h-10 w-10" />
      </div>
    </header>
  );
}
