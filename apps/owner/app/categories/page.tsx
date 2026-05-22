"use client";

import { useState } from "react";
import { Plus, GripVertical, Edit3, ToggleLeft, ToggleRight } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { categories as initial } from "@/lib/mock-data";
import { CategoryIcon } from "@/components/Icons";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const [cats, setCats] = useState(initial);

  const toggle = (id: string) =>
    setCats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)),
    );

  return (
    <>
      <TopBar
        title="หมวดหมู่เมนู"
        subtitle={`${cats.length} หมวดหมู่`}
        action={
          <button className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-pop hover:bg-brand-600">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            เพิ่มหมวดหมู่
          </button>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="rounded-2xl border border-cream-200 bg-white shadow-soft overflow-hidden max-w-3xl">
          <ul className="divide-y divide-cream-100">
            {cats
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((c, idx) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-cream-50"
                >
                  <button
                    aria-label="จัดเรียง"
                    className="text-ink-300 hover:text-ink-500 cursor-grab"
                  >
                    <GripVertical className="h-5 w-5" />
                  </button>
                  <CategoryIcon id={c.id} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-ink-800">
                        {c.name}
                      </span>
                      <span className="text-xs text-ink-400">{c.nameEn}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-ink-500">
                      {c.itemCount} เมนู
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(c.id)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all"
                  >
                    {c.isActive ? (
                      <ToggleRight className="h-6 w-6 text-herb-500" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-ink-300" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        c.isActive ? "text-herb-700" : "text-ink-400",
                      )}
                    >
                      {c.isActive ? "เปิดใช้งาน" : "ปิดอยู่"}
                    </span>
                  </button>
                  <button
                    aria-label="แก้ไข"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink-400 hover:bg-cream-100 hover:text-ink-700"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </main>
    </>
  );
}
