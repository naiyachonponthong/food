"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  allowZero = false,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  allowZero?: boolean;
}) {
  const dim =
    size === "lg" ? "h-11 w-11" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const text =
    size === "lg" ? "text-lg w-10" : size === "sm" ? "text-sm w-6" : "text-base w-8";

  const lowerBound = allowZero ? 0 : min;
  const showTrash = allowZero && value === 1;

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-cream-200 p-1">
      <button
        onClick={() => onChange(Math.max(lowerBound, value - 1))}
        disabled={value <= lowerBound}
        aria-label="ลดจำนวน"
        className={cn(
          dim,
          "flex items-center justify-center rounded-full bg-white text-ink-700 shadow-soft disabled:bg-cream-100 disabled:text-ink-300 disabled:shadow-none",
        )}
      >
        {showTrash ? (
          <Trash2 className="h-4 w-4 text-brand-500" />
        ) : (
          <Minus className="h-4 w-4" strokeWidth={2.5} />
        )}
      </button>
      <span className={cn(text, "text-center font-semibold tabular text-ink-800")}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="เพิ่มจำนวน"
        className={cn(
          dim,
          "flex items-center justify-center rounded-full bg-brand-500 text-white shadow-pop disabled:bg-ink-200 disabled:shadow-none",
        )}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
