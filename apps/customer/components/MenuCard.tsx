"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, Flame } from "lucide-react";
import type { MenuItem } from "@/lib/mock-data";
import { useCartStore } from "@/lib/cart-store";
import { cn, formatPrice } from "@/lib/utils";
import { FoodImage } from "./FoodImage";

export function MenuCard({ menu, layout = "grid" }: { menu: MenuItem; layout?: "grid" | "list" }) {
  const params = useParams<{ token: string }>();
  const cart = useCartStore((s) => s.cart);
  const inCart = cart
    .filter((c) => c.menuId === menu.id)
    .reduce((s, c) => s + c.quantity, 0);

  if (layout === "list") {
    return (
      <Link
        href={`/${params.token}/menu/${menu.id}`}
        className={cn(
          "group flex gap-3 rounded-3xl border border-cream-200 bg-white p-3 transition-all hover:border-brand-200 hover:shadow-soft",
          !menu.isAvailable && "opacity-60",
        )}
      >
        <div className="relative h-24 w-24 flex-shrink-0">
          <FoodImage menu={menu} size="md" rounded="rounded-2xl" className="h-full w-full" />
          {!menu.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-ink-800/60 text-xs font-semibold text-white">
              หมด
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="truncate text-sm font-semibold text-ink-800">
                  {menu.name}
                </h3>
                {menu.spicyLevel && menu.spicyLevel >= 2 && (
                  <Flame className="h-3.5 w-3.5 text-brand-500" strokeWidth={2.5} fill="currentColor" />
                )}
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-ink-400">
                {menu.description}
              </p>
            </div>
          </div>
          <div className="mt-auto flex items-end justify-between pt-2">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-ink-800 tabular">
                {formatPrice(menu.price)}
              </span>
              {menu.calories && (
                <span className="text-[10px] text-ink-400">
                  {menu.calories} kcal
                </span>
              )}
            </div>
            <button
              disabled={!menu.isAvailable}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full text-white transition-all",
                menu.isAvailable
                  ? "bg-brand-500 shadow-pop hover:bg-brand-600"
                  : "bg-ink-200",
              )}
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
              {inCart > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-cream-100 bg-herb-500 px-1 text-[10px] font-bold text-white tabular">
                  {inCart}
                </span>
              )}
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Grid (featured)
  return (
    <Link
      href={`/${params.token}/menu/${menu.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift",
        !menu.isAvailable && "opacity-60",
      )}
    >
      <div className="relative aspect-square">
        <FoodImage menu={menu} size="lg" rounded="rounded-none" className="h-full w-full" />
        {menu.tags.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1">
            {menu.tags.slice(0, 1).map((t) => (
              <span
                key={t}
                className="rounded-full bg-brand-500/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-soft"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {menu.spicyLevel && menu.spicyLevel >= 2 && (
          <div className="absolute right-3 top-3 flex h-7 items-center gap-0.5 rounded-full bg-white/95 px-2 shadow-soft">
            {Array.from({ length: menu.spicyLevel }).map((_, i) => (
              <Flame
                key={i}
                className="h-3 w-3 text-brand-500"
                strokeWidth={2.5}
                fill="currentColor"
              />
            ))}
          </div>
        )}
        {!menu.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-800/50 text-base font-semibold text-white">
            หมดชั่วคราว
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-ink-800">
          {menu.name}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-ink-400">
          {menu.nameEn}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-bold text-ink-800 tabular">
            {formatPrice(menu.price)}
          </span>
          <button
            disabled={!menu.isAvailable}
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded-full text-white",
              menu.isAvailable ? "bg-brand-500 shadow-pop" : "bg-ink-200",
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            {inCart > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-herb-500 px-0.5 text-[9px] font-bold text-white tabular">
                {inCart}
              </span>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
