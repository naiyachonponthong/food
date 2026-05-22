"use client";

import { ChevronDown, Search } from "lucide-react";
import { restaurant } from "@/lib/mock-data";

export function TopBar({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-cream-200 bg-white/80 px-6 py-4 backdrop-blur">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold leading-tight text-ink-800">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {action}
        <button
          aria-label="เลือกสาขา"
          className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-cream-300 bg-white px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-50"
        >
          <span className="h-2 w-2 rounded-full bg-herb-500" />
          <span>สาขาทองหล่อ</span>
          <ChevronDown className="h-4 w-4 text-ink-400" />
        </button>
      </div>
    </header>
  );
}
