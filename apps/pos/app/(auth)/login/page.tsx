"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Wallet,
  ChefHat,
  ArrowRight,
  Sparkles,
  Lock,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RESTAURANT_NAME } from "@/lib/mock-data";

type Role = {
  id: "admin" | "cashier" | "kitchen";
  label: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  redirect: string;
};

const ROLES: Role[] = [
  {
    id: "admin",
    label: "Admin",
    description: "ผู้ดูแลระบบ · จัดการสาขา / เมนู / รายงาน",
    icon: ShieldCheck,
    tone: "from-blue-500 to-indigo-600",
    redirect: "/tables",
  },
  {
    id: "cashier",
    label: "Cashier",
    description: "แคชเชียร์ · รับชำระเงิน / จัดการโต๊ะ",
    icon: Wallet,
    tone: "from-emerald-500 to-teal-600",
    redirect: "/payments",
  },
  {
    id: "kitchen",
    label: "Kitchen",
    description: "ครัว · รับออเดอร์ / อัปเดตสถานะ",
    icon: ChefHat,
    tone: "from-violet-500 to-fuchsia-600",
    redirect: "/kitchen",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Role | null>(null);

  const proceed = () => {
    if (!selected) return;
    router.push(selected.redirect);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream-100 p-6">
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-brand-300/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-[480px] w-[480px] rounded-full bg-accent-300/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(148, 163, 184, 0.35) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_440px]">
        {/* Left: brand + intro */}
        <div className="hidden lg:flex flex-col justify-between rounded-3xl bg-white p-8 shadow-soft border border-cream-200">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700">
              <Sparkles className="h-3 w-3" />
              Multi-Branch · Restaurant POS
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-ink-800">
              {RESTAURANT_NAME}
            </h1>
            <p className="mt-1 text-base text-ink-500">Plearn Kitchen POS</p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-500">
              จัดการร้านอาหารครบทุกฟังก์ชั่น — เปิดโต๊ะ พิมพ์ QR สั่งอาหาร
              ส่งครัว และรับชำระเงินในระบบเดียว รองรับหลายสาขา
              พร้อมโหมดบุฟเฟ่ต์
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <Feature label="Fast access" />
            <Feature label="Multi-branch" />
            <Feature label="Reliable" />
          </div>
        </div>

        {/* Right: sign-in card */}
        <div className="rounded-3xl bg-white p-6 shadow-lift border border-cream-200">
          <header className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                Sign in
              </div>
              <h2 className="mt-0.5 text-2xl font-bold text-ink-800">
                เข้าสู่ระบบ
              </h2>
              <p className="mt-0.5 text-xs text-ink-400">เลือกบทบาทเพื่อเริ่ม</p>
            </div>
            <button className="flex items-center gap-1 rounded-full border border-cream-300 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-cream-50">
              <span className="h-1.5 w-1.5 rounded-full bg-herb-500" />
              <span>สาขาทองหล่อ</span>
              <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
            </button>
          </header>

          <div className="mt-5 space-y-2">
            {ROLES.map((r) => {
              const isActive = selected?.id === r.id;
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-all",
                    isActive
                      ? "border-ink-800 bg-ink-800 text-white shadow-pop"
                      : "border-cream-200 bg-white hover:border-cream-300",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-soft",
                      r.tone,
                    )}
                  >
                    <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "text-base font-bold",
                        isActive ? "text-white" : "text-ink-800",
                      )}
                    >
                      {r.label}
                    </div>
                    <div
                      className={cn(
                        "mt-0.5 text-xs",
                        isActive ? "text-white/70" : "text-ink-400",
                      )}
                    >
                      {r.description}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold transition-all",
                      isActive
                        ? "bg-white text-ink-800"
                        : "bg-cream-100 text-ink-500 group-hover:bg-cream-200",
                    )}
                  >
                    <span>Enter</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={proceed}
            disabled={!selected}
            className={cn(
              "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all",
              selected
                ? "bg-brand-500 text-white shadow-pop hover:bg-brand-600"
                : "bg-cream-200 text-ink-400",
            )}
          >
            <Lock className="h-4 w-4" />
            เข้าสู่ระบบ{selected ? ` · ${selected.label}` : ""}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-herb-500" />
            Secure sign-in · Multi-branch · Reliable
          </div>
        </div>
      </div>
    </main>
  );
}

function Feature({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-cream-200 bg-cream-50 px-3 py-2 text-center">
      <div className="text-xs font-semibold text-ink-700">{label}</div>
    </div>
  );
}
