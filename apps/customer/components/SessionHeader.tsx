"use client";

import { Bell, Receipt, Globe2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CallStaffSheet } from "./CallStaffSheet";
import { useCartStore } from "@/lib/cart-store";
import { session } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function SessionHeader({
  scrolled = false,
  variant = "overlay",
}: {
  scrolled?: boolean;
  variant?: "overlay" | "solid";
}) {
  const [callOpen, setCallOpen] = useState(false);
  const [lang, setLang] = useState<"th" | "en">("th");
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const callActive = useCartStore((s) => s.callStaffActive);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 pt-safe transition-colors duration-300",
          variant === "solid"
            ? "bg-cream-100/95 backdrop-blur border-b border-cream-300/60"
            : scrolled
              ? "bg-cream-100/85 backdrop-blur-md border-b border-cream-300/60"
              : "bg-transparent",
        )}
      >
        <div className="flex items-center justify-between px-4 pt-2 pb-3">
          {/* Table chip */}
          <button className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 shadow-soft border border-white">
            <span className="text-xs text-ink-400 font-medium">โต๊ะ</span>
            <span className="text-sm font-semibold text-ink-700">
              {session.tableName}
            </span>
            <span className="mx-1 h-3 w-px bg-ink-200" />
            <span className="text-sm text-ink-500">{session.guestName}</span>
            <ChevronDown className="h-4 w-4 text-ink-400" strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-1.5">
            <button
              aria-label="เปลี่ยนภาษา"
              onClick={() => setLang(lang === "th" ? "en" : "th")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-soft border border-white"
            >
              <span className="text-base">{lang === "th" ? "🇹🇭" : "🇬🇧"}</span>
            </button>
            <button
              aria-label="เรียกพนักงาน"
              onClick={() => setCallOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-soft border border-white"
            >
              <Bell className="h-5 w-5 text-ink-700" strokeWidth={2} />
              {callActive && (
                <>
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-cream-100" />
                  <span className="absolute inset-0 rounded-full bg-brand-500/20 animate-pulse-ring" />
                </>
              )}
            </button>
            <button
              aria-label="ดูออเดอร์และเช็คบิล"
              onClick={() => router.push(`/${params.token}/orders`)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-soft border border-white"
            >
              <Receipt className="h-5 w-5 text-ink-700" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>
      <CallStaffSheet open={callOpen} onClose={() => setCallOpen(false)} />
    </>
  );
}
