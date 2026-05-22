"use client";

import {
  Sparkles,
  Utensils,
  Soup,
  Salad,
  Coffee,
  CakeSlice,
  ChefHat,
  Flame,
  Wheat,
  GlassWater,
  Users,
  Home,
  Lightbulb,
  Package,
  Wrench,
  Megaphone,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CAT_ICONS: Record<string, LucideIcon> = {
  featured: Sparkles,
  rice: Wheat,
  noodle: Soup,
  "stir-fry": Flame,
  soup: Soup,
  salad: Salad,
  drink: GlassWater,
  dessert: CakeSlice,
};

const CAT_TONES: Record<string, string> = {
  featured: "from-blue-400 to-indigo-600",
  rice: "from-amber-400 to-orange-500",
  noodle: "from-yellow-400 to-rose-500",
  "stir-fry": "from-emerald-400 to-teal-600",
  soup: "from-rose-400 to-pink-600",
  salad: "from-lime-400 to-emerald-600",
  drink: "from-sky-400 to-blue-600",
  dessert: "from-pink-400 to-fuchsia-600",
};

const EXP_ICONS: Record<string, LucideIcon> = {
  salary: Users,
  rent: Home,
  utility: Lightbulb,
  packaging: Package,
  repair: Wrench,
  marketing: Megaphone,
  other: MoreHorizontal,
};

const EXP_TONES: Record<string, string> = {
  salary: "from-blue-400 to-blue-600",
  rent: "from-emerald-400 to-emerald-600",
  utility: "from-amber-400 to-amber-600",
  packaging: "from-violet-400 to-violet-600",
  repair: "from-orange-400 to-orange-600",
  marketing: "from-rose-400 to-pink-600",
  other: "from-slate-400 to-slate-600",
};

export function CategoryIcon({
  id,
  size = "md",
  className,
}: {
  id: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = CAT_ICONS[id] ?? Utensils;
  const tone = CAT_TONES[id] ?? "from-slate-400 to-slate-600";
  const dim = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const iconSize = size === "lg" ? 22 : size === "sm" ? 14 : 18;
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-to-br shadow-soft",
        dim,
        tone,
        className,
      )}
    >
      <Icon size={iconSize} strokeWidth={2} className="text-white" />
    </div>
  );
}

export function ExpenseIcon({
  id,
  size = "md",
  className,
}: {
  id: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = EXP_ICONS[id] ?? MoreHorizontal;
  const tone = EXP_TONES[id] ?? "from-slate-400 to-slate-600";
  const dim = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-7 w-7" : "h-10 w-10";
  const iconSize = size === "lg" ? 22 : size === "sm" ? 14 : 18;
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-to-br shadow-soft",
        dim,
        tone,
        className,
      )}
    >
      <Icon size={iconSize} strokeWidth={2} className="text-white" />
    </div>
  );
}
