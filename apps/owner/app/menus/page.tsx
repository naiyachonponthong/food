"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Eye,
  EyeOff,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import {
  categories,
  menus as initialMenus,
  type MenuItem,
} from "@/lib/mock-data";
import { CategoryIcon } from "@/components/Icons";
import { cn, formatPrice } from "@/lib/utils";

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>(initialMenus);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");

  const filtered = menus.filter((m) => {
    if (activeCat !== "all" && m.categoryId !== activeCat) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.nameEn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleAvail = (id: string) =>
    setMenus((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isAvailable: !m.isAvailable } : m)),
    );

  return (
    <>
      <TopBar
        title="เมนู"
        subtitle={`${menus.length} เมนู · ${menus.filter((m) => m.isAvailable).length} พร้อมขาย`}
        action={
          <button className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-pop hover:bg-brand-600">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            เพิ่มเมนูใหม่
          </button>
        }
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Search + filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาเมนู..."
              className="w-full rounded-full border border-cream-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-ink-300 focus:border-brand-300 sm:w-80"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-cream-300 bg-white px-3 py-2 text-sm font-medium text-ink-600">
            <Filter className="h-4 w-4" />
            ตัวกรอง
          </button>
        </div>

        {/* Category tabs */}
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          <CategoryChip
            label="ทั้งหมด"
            count={menus.length}
            active={activeCat === "all"}
            onClick={() => setActiveCat("all")}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              iconId={c.id}
              label={c.name}
              count={menus.filter((m) => m.categoryId === c.id).length}
              active={activeCat === c.id}
              onClick={() => setActiveCat(c.id)}
            />
          ))}
        </div>

        {/* Table */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft">
          <div className="grid grid-cols-[1fr_120px_100px_100px_100px_50px] items-center gap-4 border-b border-cream-200 bg-cream-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
            <div>ชื่อเมนู</div>
            <div>หมวด</div>
            <div className="text-right">ราคา</div>
            <div className="text-right">ต้นทุน</div>
            <div className="text-right">สถานะ</div>
            <div></div>
          </div>
          <ul className="divide-y divide-cream-100">
            {filtered.map((m) => (
              <li
                key={m.id}
                className="grid grid-cols-[1fr_120px_100px_100px_100px_50px] items-center gap-4 px-5 py-3 transition-all hover:bg-cream-50"
              >
                <div className="flex items-center gap-3">
                  <CategoryIcon id={m.categoryId} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-ink-800">
                        {m.name}
                      </span>
                      {m.isFeatured && (
                        <span className="rounded-md bg-amber-100 px-1 text-[9px] font-bold uppercase text-amber-700">
                          แนะนำ
                        </span>
                      )}
                      {m.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-cream-100 px-1 text-[9px] font-medium text-ink-500"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-ink-400">
                      {m.nameEn} · ขาย {m.soldCount.toLocaleString()} ครั้ง/เดือน
                    </div>
                  </div>
                </div>
                <div className="text-xs text-ink-600">
                  {categories.find((c) => c.id === m.categoryId)?.name}
                </div>
                <div className="text-right text-sm font-bold text-ink-800 tabular">
                  {formatPrice(m.price)}
                </div>
                <div className="text-right text-xs text-ink-500 tabular">
                  {formatPrice(m.cost)}
                </div>
                <div className="text-right">
                  <button
                    onClick={() => toggleAvail(m.id)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold",
                      m.isAvailable
                        ? "bg-herb-100 text-herb-700"
                        : "bg-cream-200 text-ink-500",
                    )}
                  >
                    {m.isAvailable ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                    {m.isAvailable ? "พร้อมขาย" : "หมด"}
                  </button>
                </div>
                <div className="text-right">
                  <button
                    aria-label="ตัวเลือกเพิ่มเติม"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-cream-100 hover:text-ink-700"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-5 py-12 text-center text-sm text-ink-400">
                ไม่พบเมนูในเงื่อนไขที่เลือก
              </li>
            )}
          </ul>
        </div>
      </main>
    </>
  );
}

function CategoryChip({
  iconId,
  label,
  count,
  active,
  onClick,
}: {
  iconId?: string;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "bg-ink-800 text-white"
          : "bg-white text-ink-600 border border-cream-300 hover:border-cream-400",
      )}
    >
      {iconId && <CategoryIcon id={iconId} size="sm" />}
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0 text-[10px] tabular",
          active ? "bg-white/20 text-white" : "bg-cream-200 text-ink-500",
        )}
      >
        {count}
      </span>
    </button>
  );
}
