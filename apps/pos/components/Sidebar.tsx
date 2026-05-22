"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ClipboardList,
  ChefHat,
  CreditCard,
  Settings,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RESTAURANT_NAME } from "@/lib/mock-data";

const NAV = [
  { href: "/tables", label: "โต๊ะ", icon: LayoutGrid },
  { href: "/orders", label: "ออเดอร์", icon: ClipboardList },
  { href: "/kitchen", label: "ครัว", icon: ChefHat },
  { href: "/payments", label: "ชำระเงิน", icon: CreditCard },
  { href: "/settings", label: "ตั้งค่า", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-cream-300 bg-white">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-cream-200">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-pop">
          <Utensils className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-ink-400">
            POS
          </div>
          <div className="text-sm font-semibold leading-tight text-ink-800">
            {RESTAURANT_NAME}
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-brand-500 text-white shadow-pop"
                  : "text-ink-600 hover:bg-cream-100",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-cream-200 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-cream-100 px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-herb-100 text-herb-700 font-semibold">
            N
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink-800">
              Nawawat
            </div>
            <div className="text-xs text-ink-400">พนักงาน</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
