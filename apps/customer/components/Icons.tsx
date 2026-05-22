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
  Beef,
  Wheat,
  GlassWater,
  IceCream,
  Egg,
  Drumstick,
  Fish,
  Cookie,
  Apple,
  type LucideIcon,
} from "lucide-react";

// --- Category icon map ---
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  featured: Sparkles,
  rice: Wheat,
  noodle: Soup,
  "stir-fry": Flame,
  soup: Soup,
  salad: Salad,
  drink: GlassWater,
  dessert: CakeSlice,
};

// --- Per-menu icon map (granular) ---
const MENU_ICONS: Record<string, LucideIcon> = {
  m_pad_kra_pao: Egg,
  m_khao_man_kai: Drumstick,
  m_khao_kha_moo: Beef,
  m_pad_thai: Fish,
  m_ba_mee: Soup,
  m_yen_ta_fo: Soup,
  m_pad_see_ew: Flame,
  m_pad_pak: Salad,
  m_tom_yum: Fish,
  m_gaeng_keaw: ChefHat,
  m_som_tum: Salad,
  m_larb: Beef,
  m_thai_tea: Coffee,
  m_lime_soda: GlassWater,
  m_water: GlassWater,
  m_mango_sticky: Apple,
  m_bua_loy: Cookie,
};

export function categoryIcon(id: string): LucideIcon {
  return CATEGORY_ICONS[id] ?? Utensils;
}

export function menuIcon(id: string): LucideIcon {
  return MENU_ICONS[id] ?? Utensils;
}

export function CategoryIconCmp({
  id,
  className,
  size = 20,
  strokeWidth = 2,
}: {
  id: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = categoryIcon(id);
  return <Icon className={className} size={size} strokeWidth={strokeWidth} />;
}

export function MenuIconCmp({
  id,
  className,
  size = 20,
  strokeWidth = 2,
}: {
  id: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = menuIcon(id);
  return <Icon className={className} size={size} strokeWidth={strokeWidth} />;
}
