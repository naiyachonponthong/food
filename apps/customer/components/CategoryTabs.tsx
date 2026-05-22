"use client";

import { useEffect, useRef } from "react";
import { categories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { categoryIcon } from "./Icons";

export function CategoryTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.querySelector<HTMLButtonElement>(
      `[data-cat="${active}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  return (
    <div
      ref={ref}
      className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3"
    >
      {categories.map((cat) => {
        const isActive = active === cat.id;
        const Icon = categoryIcon(cat.id);
        return (
          <button
            key={cat.id}
            data-cat={cat.id}
            onClick={() => onChange(cat.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "border-brand-500 bg-brand-500 text-white shadow-pop"
                : "border-cream-300 bg-white text-ink-600 hover:border-brand-300",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
