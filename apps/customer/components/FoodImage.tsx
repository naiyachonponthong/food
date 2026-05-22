"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { type MenuItem } from "@/lib/mock-data";
import { menuIcon } from "./Icons";

const categoryGradient: Record<string, string> = {
  featured: "from-blue-400 via-blue-500 to-indigo-600",
  rice: "from-amber-300 via-amber-400 to-orange-500",
  noodle: "from-yellow-300 via-amber-400 to-rose-500",
  "stir-fry": "from-emerald-300 via-teal-400 to-cyan-500",
  soup: "from-rose-300 via-pink-400 to-fuchsia-500",
  salad: "from-lime-300 via-emerald-400 to-teal-500",
  drink: "from-sky-300 via-cyan-400 to-blue-500",
  dessert: "from-pink-300 via-rose-400 to-purple-500",
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
  const grad = categoryGradient[menu.categoryId] || "from-slate-300 to-slate-400";
  const Icon = menuIcon(menu.id);

  const iconSize =
    size === "xl" ? 96 : size === "lg" ? 64 : size === "md" ? 36 : 22;

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
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
      />

      <div className="relative flex h-full w-full items-center justify-center">
        <Icon
          size={iconSize}
          strokeWidth={1.5}
          className="text-white drop-shadow"
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.18))" }}
        />
      </div>
    </div>
  );
}
