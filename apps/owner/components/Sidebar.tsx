"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  Grid3x3,
  Wallet,
  BarChart3,
  Settings,
  Sparkles,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { restaurant } from "@/lib/mock-data";

const NAV = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/menus", label: "เมนู", icon: UtensilsCrossed },
  { href: "/categories", label: "หมวดหมู่", icon: FolderTree },
  { href: "/packages", label: "บุฟเฟ่ต์", icon: Package },
  { href: "/tables", label: "โต๊ะ & QR", icon: Grid3x3 },
  { href: "/expenses", label: "ค่าใช้จ่าย", icon: Wallet },
  { href: "/reports", label: "รายงาน P&L", icon: BarChart3 },
  { href: "/settings", label: "ตั้งค่าร้าน", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-cream-300 bg-white">
      <div className="border-b border-cream-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-pop">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wider text-ink-400">
              Owner Console
            </div>
            <div className="truncate text-sm font-bold text-ink-800">
              {restaurant.name}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const isActive = pathname?.startsWith(item.href);
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
        <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-cream-100 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
            Pro Plan
          </div>
          <div className="mt-1 text-xs text-ink-600">
            ใช้งานได้ทุกฟีเจอร์ ครบทุกสาขา
          </div>
          <div className="mt-2 text-[10px] text-ink-400">
            ต่ออายุอีก 7 วัน
          </div>
        </div>
      </div>
    </aside>
  );
}
