"use client";

import { useState } from "react";
import {
  Store,
  Percent,
  Banknote,
  Bell,
  Receipt,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  ChefHat,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { restaurant as initial } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [r, setR] = useState(initial);
  const [tab, setTab] = useState<"shop" | "mobile" | "tax">("shop");

  const update = <K extends keyof typeof r>(key: K, value: (typeof r)[K]) =>
    setR((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <TopBar title="ตั้งค่าร้าน" subtitle="ข้อมูลร้าน, โหมด, ภาษี, การชำระเงิน" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {/* Tabs */}
          <div className="flex gap-1 rounded-2xl bg-white p-1 shadow-soft border border-cream-200 w-fit">
            {[
              { v: "shop", label: "ข้อมูลร้าน" },
              { v: "mobile", label: "Mobile Order" },
              { v: "tax", label: "ภาษี & การเงิน" },
            ].map((t) => (
              <button
                key={t.v}
                onClick={() => setTab(t.v as typeof tab)}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                  tab === t.v
                    ? "bg-brand-500 text-white shadow-pop"
                    : "text-ink-600 hover:bg-cream-100",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "shop" && (
            <Card title="ข้อมูลร้าน" icon={<Store className="h-4 w-4" />}>
              <Field label="ชื่อร้าน (ไทย)">
                <input
                  defaultValue={r.name}
                  className="w-full rounded-xl border-2 border-cream-200 bg-white px-3 py-2.5 text-sm focus:border-brand-300 outline-none"
                />
              </Field>
              <Field label="ชื่อร้าน (อังกฤษ)">
                <input
                  defaultValue={r.nameEn}
                  className="w-full rounded-xl border-2 border-cream-200 bg-white px-3 py-2.5 text-sm focus:border-brand-300 outline-none"
                />
              </Field>
              <Field label="คำโปรย">
                <input
                  defaultValue={r.tagline}
                  className="w-full rounded-xl border-2 border-cream-200 bg-white px-3 py-2.5 text-sm focus:border-brand-300 outline-none"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="เบอร์โทร">
                  <input
                    defaultValue={r.phone}
                    className="w-full rounded-xl border-2 border-cream-200 bg-white px-3 py-2.5 text-sm focus:border-brand-300 outline-none"
                  />
                </Field>
                <Field label="เลขผู้เสียภาษี">
                  <input
                    defaultValue={r.taxId}
                    className="w-full rounded-xl border-2 border-cream-200 bg-white px-3 py-2.5 text-sm focus:border-brand-300 outline-none"
                  />
                </Field>
              </div>
              <Field label="ที่อยู่">
                <textarea
                  rows={2}
                  defaultValue={r.address}
                  className="w-full resize-none rounded-xl border-2 border-cream-200 bg-white px-3 py-2.5 text-sm focus:border-brand-300 outline-none"
                />
              </Field>
            </Card>
          )}

          {tab === "mobile" && (
            <>
              <Card title="โหมดของร้าน" icon={<Sparkles className="h-4 w-4" />}>
                <div className="grid grid-cols-2 gap-3">
                  <ModeCard
                    title="Normal"
                    desc="ร้านอาหารทั่วไป สั่ง a la carte"
                    active={r.mode === "normal"}
                    onClick={() => update("mode", "normal")}
                  />
                  <ModeCard
                    title="Buffet"
                    desc="ชาบู / บุฟเฟ่ต์ มี Package + Timer"
                    active={r.mode === "buffet"}
                    onClick={() => update("mode", "buffet")}
                  />
                </div>
              </Card>

              <Card title="Mobile Order" icon={<ChefHat className="h-4 w-4" />}>
                <ToggleRow
                  label="เรียกพนักงานได้"
                  desc="ลูกค้ากดเรียกอุปกรณ์ / เครื่องปรุง"
                  value={r.allowCallStaff}
                  onChange={(v) => update("allowCallStaff", v)}
                />
                <ToggleRow
                  label="ชำระเงินด้วยตัวเอง"
                  desc="ลูกค้าจ่ายผ่าน QR PromptPay ในมือถือ"
                  value={r.allowSelfCheckout}
                  onChange={(v) => update("allowSelfCheckout", v)}
                />
                <ToggleRow
                  label="ครัวพิมพ์ออเดอร์อัตโนมัติ"
                  desc="พิมพ์ใบสั่งเมื่อมีออเดอร์ใหม่ทันที"
                  value={r.kitchenPrintAuto}
                  onChange={(v) => update("kitchenPrintAuto", v)}
                />
                <ToggleRow
                  label="ครัวรับออเดอร์อัตโนมัติ"
                  desc="ข้ามขั้น 'ครัวรับ' ไปยัง 'กำลังทำ' ทันที"
                  value={r.autoConfirmOrder}
                  onChange={(v) => update("autoConfirmOrder", v)}
                />
                <ToggleRow
                  label="ตรวจสอบสลิปก่อน"
                  desc="ต้องให้พนักงาน verify ก่อนปิดบิล"
                  value={r.slipVerifyEnabled}
                  onChange={(v) => update("slipVerifyEnabled", v)}
                />
              </Card>
            </>
          )}

          {tab === "tax" && (
            <>
              <Card title="ภาษี & ค่าบริการ" icon={<Percent className="h-4 w-4" />}>
                <ToggleRow
                  label="คิดภาษีมูลค่าเพิ่ม (VAT)"
                  value={r.hasVat}
                  onChange={(v) => update("hasVat", v)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="VAT (%)">
                    <input
                      type="number"
                      defaultValue={r.vatRate}
                      step="0.01"
                      disabled={!r.hasVat}
                      className="w-full rounded-xl border-2 border-cream-200 bg-white px-3 py-2.5 text-sm focus:border-brand-300 outline-none disabled:bg-cream-100"
                    />
                  </Field>
                  <Field label="Service Charge (%)">
                    <input
                      type="number"
                      defaultValue={r.serviceCharge}
                      step="0.01"
                      className="w-full rounded-xl border-2 border-cream-200 bg-white px-3 py-2.5 text-sm focus:border-brand-300 outline-none"
                    />
                  </Field>
                </div>
              </Card>

              <Card title="PromptPay" icon={<Banknote className="h-4 w-4" />}>
                <Field label="เบอร์ PromptPay">
                  <input
                    defaultValue={r.promptpayNumber}
                    className="w-full rounded-xl border-2 border-cream-200 bg-white px-3 py-2.5 text-sm font-mono focus:border-brand-300 outline-none"
                  />
                </Field>
                <p className="mt-2 text-xs text-ink-400">
                  ใช้สำหรับสร้าง QR Code ในตอนชำระเงิน
                </p>
              </Card>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button className="rounded-2xl border-2 border-cream-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-cream-100">
              ยกเลิก
            </button>
            <button className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-pop hover:bg-blue-700">
              บันทึก
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft border border-cream-200">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink-800">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </span>
        {title}
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-cream-50 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-ink-800">{label}</div>
        {desc && <div className="mt-0.5 text-xs text-ink-400">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        aria-label={value ? "ปิด" : "เปิด"}
        className="flex-shrink-0"
      >
        {value ? (
          <ToggleRight className="h-7 w-7 text-herb-500" />
        ) : (
          <ToggleLeft className="h-7 w-7 text-ink-300" />
        )}
      </button>
    </div>
  );
}

function ModeCard({
  title,
  desc,
  active,
  onClick,
}: {
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-2xl border-2 p-4 text-left transition-all",
        active
          ? "border-brand-500 bg-brand-50/40 shadow-soft"
          : "border-cream-200 bg-white hover:border-cream-300",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-ink-800">{title}</span>
        <div
          className={cn(
            "h-4 w-4 rounded-full border-2",
            active ? "border-brand-500 bg-brand-500" : "border-cream-300",
          )}
        >
          {active && (
            <div className="h-full w-full flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
          )}
        </div>
      </div>
      <div className="mt-1 text-xs text-ink-500">{desc}</div>
    </button>
  );
}
