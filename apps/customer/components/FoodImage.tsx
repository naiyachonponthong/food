"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getCategoryById, type MenuItem } from "@/lib/mock-data";

const categoryGradient: Record<string, string> = {
  featured: "from-amber-200 via-orange-300 to-rose-400",
  rice: "from-amber-100 via-orange-200 to-rose-300",
  noodle: "from-yellow-100 via-amber-200 to-orange-300",
  "stir-fry": "from-emerald-100 via-lime-200 to-amber-200",
  soup: "from-rose-200 via-orange-300 to-amber-300",
  salad: "from-lime-100 via-emerald-200 to-teal-300",
  drink: "from-sky-100 via-cyan-200 to-blue-300",
  dessert: "from-pink-100 via-rose-200 to-fuchsia-300",
};

const menuEmoji: Record<string, string> = {
  m_pad_kra_pao: "🍳",
  m_khao_man_kai: "🍗",
  m_khao_kha_moo: "🍖",
  m_pad_thai: "🍤",
  m_ba_mee: "🍜",
  m_yen_ta_fo: "🥢",
  m_pad_see_ew: "🥘",
  m_pad_pak: "🥬",
  m_tom_yum: "🦐",
  m_gaeng_keaw: "🥥",
  m_som_tum: "🌶️",
  m_larb: "🥗",
  m_thai_tea: "🧋",
  m_lime_soda: "🍋",
  m_water: "💧",
  m_mango_sticky: "🥭",
  m_bua_loy: "🍡",
};

export function FoodImage({
  menu,
  className,
  size = "md",
  rounded = "rounded-2xl",
}: {
  menu: MenuItem;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);
  const cat = getCategoryById(menu.categoryId);
  const grad = categoryGradient[menu.categoryId] || "from-cream-200 to-cream-300";
  const emoji = menuEmoji[menu.id] || cat?.icon || "🍽️";

  const emojiSize =
    size === "xl"
      ? "text-[140px]"
      : size === "lg"
        ? "text-[88px]"
        : size === "md"
          ? "text-5xl"
          : "text-3xl";

  // Try real image first; fall back to gradient placeholder
  if (menu.image && !failed) {
    return (
      <div
        className={cn(
          "relative overflow-hidden",
          rounded,
          `bg-gradient-to-br ${grad}`,
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={menu.image}
          alt={menu.name}
          onError={() => setFailed(true)}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        rounded,
        `bg-gradient-to-br ${grad}`,
        className,
      )}
    >
      {/* Soft decorative blobs */}
      <div className="pointer-events-none absolute -left-4 -top-4 h-20 w-20 rounded-full bg-white/40 blur-2xl" />
      <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-black/10 blur-2xl" />

      {/* Subtle dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
      />

      <div className="relative flex h-full w-full items-center justify-center">
        <span
          className={cn(emojiSize, "drop-shadow-sm")}
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}
        >
          {emoji}
        </span>
      </div>
    </div>
  );
}
