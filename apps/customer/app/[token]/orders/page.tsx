"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChefHat,
  Receipt,
  PartyPopper,
  Clock,
  CheckCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toast } from "@/components/Toast";
import { FoodImage } from "@/components/FoodImage";
import { useCartStore, calcLineSubtotal } from "@/lib/cart-store";
import { getMenuById } from "@/lib/mock-data";
import type { PlacedOrderItem } from "@/lib/cart-store";
import { cn, formatPrice } from "@/lib/utils";

const statusMeta: Record<
  PlacedOrderItem["status"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "รอครัวรับ",
    color: "bg-ink-100 text-ink-600",
    icon: <Clock className="h-3 w-3" />,
  },
  confirmed: {
    label: "ครัวรับแล้ว",
    color: "bg-amber-100 text-amber-700",
    icon: <ChefHat className="h-3 w-3" />,
  },
  preparing: {
    label: "กำลังทำ",
    color: "bg-brand-100 text-brand-700",
    icon: <ChefHat className="h-3 w-3" />,
  },
  ready: {
    label: "พร้อมเสิร์ฟ",
    color: "bg-blue-100 text-blue-700",
    icon: <Sparkles className="h-3 w-3" />,
  },
  served: {
    label: "เสิร์ฟแล้ว",
    color: "bg-herb-100 text-herb-700",
    icon: <CheckCheck className="h-3 w-3" />,
  },
};

export default function OrdersPage() {
  const params = useParams<{ token: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const orders = useCartStore((s) => s.orders);
  const advance = useCartStore((s) => s.advanceMockStatus);
  const [showPlaced, setShowPlaced] = useState(false);

  useEffect(() => {
    if (search.get("placed") === "1") {
      setShowPlaced(true);
      const t = setTimeout(() => setShowPlaced(false), 4000);
      return () => clearTimeout(t);
    }
  }, [search]);

  // Demo: auto-advance status every 8s to simulate the kitchen flow
  useEffect(() => {
    if (orders.length === 0) return;
    const interval = setInterval(advance, 8000);
    return () => clearInterval(interval);
  }, [orders.length, advance]);

  const allItems = orders.flatMap((o) =>
    o.items.map((it) => ({ ...it, orderNumber: o.orderNumber })),
  );
  const totalAmount = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, it) => s + calcLineSubtotal(it), 0),
    0,
  );

  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-cream-100">
        <Header back title="รายการที่สั่ง" />
        <div className="flex flex-col items-center justify-center px-6 pt-24 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cream-200">
            <Receipt className="h-12 w-12 text-ink-300" strokeWidth={1.5} />
          </div>
          <h2 className="mt-6 font-display text-xl font-semibold text-ink-700">
            ยังไม่มีรายการที่สั่ง
          </h2>
          <p className="mt-2 text-sm text-ink-400">
            กลับไปสั่งอาหารกันก่อนเลย
          </p>
          <button
            onClick={() => router.push(`/${params.token}`)}
            className="mt-6 rounded-2xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-pop"
          >
            ดูเมนู
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-100 pb-28">
      <Header back title="รายการที่สั่ง" count={allItems.length} />

      <div className="space-y-4 px-4 pt-3">
        <AnimatePresence>
          {orders
            .slice()
            .reverse()
            .map((order) => (
              <motion.section
                key={order.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white shadow-soft overflow-hidden"
              >
                <header className="flex items-center justify-between border-b border-cream-200 bg-cream-50 px-4 py-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                      ออเดอร์ที่ {order.roundNumber}
                    </div>
                    <div className="font-mono text-xs font-semibold text-ink-700">
                      {order.orderNumber}
                    </div>
                  </div>
                  <div className="text-right text-xs text-ink-400 tabular">
                    {new Date(order.placedAt).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </header>
                <div className="divide-y divide-cream-200">
                  {order.items.map((it) => {
                    const meta = statusMeta[it.status];
                    return (
                      <div key={it.id} className="flex gap-3 px-4 py-3">
                        <div className="h-14 w-14 flex-shrink-0">
                          {(() => {
                            const menu = getMenuById(it.menuId);
                            return menu ? (
                              <FoodImage menu={menu} size="sm" rounded="rounded-xl" className="h-full w-full" />
                            ) : (
                              <div className="h-full w-full rounded-xl bg-cream-200" />
                            );
                          })()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold text-ink-800">
                                {it.quantity}× {it.name}
                              </div>
                              {it.options.length > 0 && (
                                <div className="mt-0.5 text-xs text-ink-400">
                                  {it.options.map((o) => o.choice.name).join(" · ")}
                                </div>
                              )}
                              <div className="mt-0.5 text-[10px] text-ink-400">
                                สั่งโดย: {it.orderedBy}
                              </div>
                            </div>
                            <span
                              className={cn(
                                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                meta.color,
                              )}
                            >
                              {meta.icon}
                              {meta.label}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm font-bold text-ink-800 tabular">
                          {formatPrice(calcLineSubtotal(it))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            ))}
        </AnimatePresence>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 pb-safe">
        <div className="mx-auto max-w-md border-t border-cream-200 bg-white/95 px-4 py-3 backdrop-blur">
          <button
            onClick={() => router.push(`/${params.token}/bill`)}
            className="flex w-full items-center justify-between rounded-2xl bg-ink-800 px-5 py-4 font-semibold text-white hover:bg-ink-900"
          >
            <span className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              บิลค่าอาหาร
            </span>
            <span className="tabular">{formatPrice(totalAmount)}</span>
          </button>
        </div>
      </div>

      <Toast
        show={showPlaced}
        onClose={() => setShowPlaced(false)}
        title="สั่งอาหารเรียบร้อย!"
        description="ครัวกำลังเตรียมเมนูของคุณ"
      />
    </main>
  );
}

function Header({
  title,
  back,
  count,
}: {
  title: string;
  back?: boolean;
  count?: number;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 border-b border-cream-200 bg-cream-100/95 pt-safe backdrop-blur">
      <div className="flex items-center gap-2 px-4 py-3">
        {back && (
          <button
            onClick={() => router.back()}
            aria-label="ย้อนกลับ"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft"
          >
            <ArrowLeft className="h-5 w-5 text-ink-800" />
          </button>
        )}
        <h1 className="flex-1 text-center font-display text-lg font-bold text-ink-800">
          {title}
          {count !== undefined && (
            <span className="ml-1 text-ink-400 tabular">({count})</span>
          )}
        </h1>
        <div className="h-10 w-10" />
      </div>
    </header>
  );
}
