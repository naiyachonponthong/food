"use client";

import { useState } from "react";
import {
  Plus,
  Sparkles,
  Clock,
  Bell,
  Repeat,
  Plus as PlusIcon,
  Edit3,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Users,
  Baby,
  CalendarPlus,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import {
  packages as initial,
  getMenuById,
  type Package,
} from "@/lib/mock-data";
import { cn, formatNumber, formatPrice } from "@/lib/utils";

export default function PackagesPage() {
  const [list, setList] = useState(initial);
  const [selected, setSelected] = useState<Package | null>(initial[0]);

  const toggle = (id: string) =>
    setList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)),
    );

  return (
    <>
      <TopBar
        title="แพ็กเกจบุฟเฟ่ต์"
        subtitle={`${list.length} แพ็กเกจ · โหมดบุฟเฟ่ต์`}
        action={
          <button className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-pop hover:bg-brand-600">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            สร้างแพ็กเกจใหม่
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_440px]">
          {/* Package list */}
          <div className="space-y-3">
            {list.map((p) => {
              const isSel = selected?.id === p.id;
              return (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(p)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelected(p);
                  }}
                  className={cn(
                    "block w-full cursor-pointer rounded-3xl border-2 bg-white p-5 text-left transition-all",
                    isSel
                      ? "border-brand-500 shadow-soft"
                      : "border-cream-200 hover:border-cream-300",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-lg font-bold text-ink-800">
                          {p.name}
                        </h3>
                        {p.id === "pkg_premium" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                            <Sparkles className="h-2.5 w-2.5" />
                            Premium
                          </span>
                        )}
                        {!p.isActive && (
                          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-500">
                            ปิดอยู่
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-ink-500">
                        {p.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(p.id);
                        }}
                      >
                        {p.isActive ? (
                          <ToggleRight className="h-6 w-6 text-herb-500" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-ink-300" />
                        )}
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-cream-100 hover:text-ink-700"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Pricing strip */}
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    <Stat
                      icon={<Users className="h-3.5 w-3.5" />}
                      label="ผู้ใหญ่"
                      value={formatPrice(p.priceAdult)}
                    />
                    <Stat
                      icon={<Baby className="h-3.5 w-3.5" />}
                      label="เด็ก"
                      value={formatPrice(p.priceChild)}
                    />
                    <Stat
                      icon={<Clock className="h-3.5 w-3.5" />}
                      label="ระยะเวลา"
                      value={`${p.durationMinutes} นาที`}
                    />
                    <Stat
                      icon={<TrendingUp className="h-3.5 w-3.5" />}
                      label="ขายเดือนนี้"
                      value={formatNumber(p.ordersThisMonth)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail / form */}
          <aside className="sticky top-6 self-start">
            {selected ? (
              <PackageDetail pkg={selected} />
            ) : (
              <div className="rounded-2xl bg-white p-6 text-center text-sm text-ink-400 border border-cream-200">
                เลือกแพ็กเกจเพื่อดูรายละเอียด
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}

function PackageDetail({ pkg }: { pkg: Package }) {
  return (
    <div className="rounded-3xl bg-white shadow-soft border border-cream-200 overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-accent-500 to-brand-700 p-5 text-white">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -left-4 -bottom-4 h-28 w-28 rounded-full bg-black/20 blur-2xl" />
        <div className="relative">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/70">
            Buffet Package
          </div>
          <h3 className="mt-1 text-2xl font-bold">{pkg.name}</h3>
          <p className="mt-1 text-xs text-white/80 line-clamp-2">{pkg.description}</p>
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 divide-x divide-cream-200">
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            <Users className="h-3 w-3" /> ผู้ใหญ่
          </div>
          <div className="mt-1 text-2xl font-bold text-ink-800 tabular">
            {formatPrice(pkg.priceAdult)}
          </div>
          <div className="text-[10px] text-ink-400">/ คน</div>
        </div>
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            <Baby className="h-3 w-3" /> เด็ก
            {pkg.childAgeMin && pkg.childAgeMax && (
              <span className="text-ink-400">
                ({pkg.childAgeMin}-{pkg.childAgeMax} ปี)
              </span>
            )}
          </div>
          <div className="mt-1 text-2xl font-bold text-ink-800 tabular">
            {formatPrice(pkg.priceChild)}
          </div>
          <div className="text-[10px] text-ink-400">/ คน</div>
        </div>
      </div>

      {/* Timer settings */}
      <div className="border-t border-cream-200 p-4 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500">
          ตั้งค่าเวลา
        </h4>
        <Row
          icon={<Clock className="h-4 w-4 text-blue-500" />}
          label="ระยะเวลาทั้งหมด"
          value={`${pkg.durationMinutes} นาที`}
        />
        <Row
          icon={<Bell className="h-4 w-4 text-amber-500" />}
          label="แจ้ง Last Order ก่อนหมดเวลา"
          value={`${pkg.lastOrderBefore} นาที`}
        />
        {pkg.extensionPrice > 0 ? (
          <Row
            icon={<CalendarPlus className="h-4 w-4 text-violet-500" />}
            label={`ต่อเวลา ครั้งละ ${pkg.extensionMinutes} นาที`}
            value={`+${formatPrice(pkg.extensionPrice)}`}
          />
        ) : (
          <Row
            icon={<CalendarPlus className="h-4 w-4 text-ink-300" />}
            label="ต่อเวลา"
            value="ไม่อนุญาต"
          />
        )}
      </div>

      {/* Package items */}
      <div className="border-t border-cream-200 p-4">
        <div className="flex items-baseline justify-between">
          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-500">
            <Repeat className="h-3.5 w-3.5 text-herb-600" />
            เมนู Refill ฟรี
            <span className="text-ink-400 normal-case">
              ({pkg.packageMenuIds.length})
            </span>
          </h4>
          <button className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
            <PlusIcon className="h-3 w-3" />
            เพิ่ม
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pkg.packageMenuIds.map((id) => {
            const menu = getMenuById(id);
            if (!menu) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-herb-50 px-2.5 py-1 text-xs font-medium text-herb-700"
              >
                {menu.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Add-ons */}
      {pkg.addons.length > 0 && (
        <div className="border-t border-cream-200 p-4">
          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-500">
            <PlusIcon className="h-3.5 w-3.5 text-brand-600" />
            Add-on (คิดเงินเพิ่ม)
            <span className="text-ink-400 normal-case">
              ({pkg.addons.length})
            </span>
          </h4>
          <ul className="mt-2 space-y-1">
            {pkg.addons.map((a) => {
              const menu = getMenuById(a.menuId);
              if (!menu) return null;
              return (
                <li
                  key={a.menuId}
                  className="flex items-center justify-between rounded-xl bg-brand-50/50 px-3 py-2"
                >
                  <span className="text-sm font-medium text-ink-700">
                    {menu.name}
                  </span>
                  <span className="text-sm font-bold text-brand-700 tabular">
                    +{formatPrice(a.price)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Sales summary */}
      <div className="border-t border-cream-200 bg-cream-50 p-4 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            ขายเดือนนี้
          </div>
          <div className="mt-0.5 text-lg font-bold text-ink-800 tabular">
            {formatNumber(pkg.ordersThisMonth)}{" "}
            <span className="text-xs text-ink-400 font-normal">ครั้ง</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            รายได้
          </div>
          <div className="mt-0.5 text-lg font-bold text-ink-800 tabular">
            {formatPrice(pkg.revenueThisMonth)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-cream-50 px-2.5 py-2">
      <div className="flex items-center gap-1 text-[10px] font-medium text-ink-500">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold text-ink-800 tabular truncate">
        {value}
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-ink-600">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-ink-800 tabular">{value}</span>
    </div>
  );
}
