"use client";

import { ChefHat, Utensils, Salad, Soup } from "lucide-react";
import { cn } from "@/lib/utils";

export function RestaurantCover({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-gradient-to-br from-brand-500 via-accent-500 to-brand-700",
        className,
      )}
    >
      {/* Layered ambient blobs */}
      <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-blue-300/45 blur-3xl" />
      <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-violet-400/40 blur-3xl" />
      <div className="absolute right-10 top-20 h-40 w-40 rounded-full bg-cyan-200/40 blur-2xl" />

      {/* Soft mesh texture */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.7) 0%, transparent 30%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.5) 0%, transparent 30%)",
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Floating icon glyphs */}
      <FloatIcon className="right-7 top-12" Icon={Soup} rotate={10} />
      <FloatIcon className="left-8 top-24" Icon={Salad} rotate={-12} />
      <FloatIcon className="right-20 bottom-12" Icon={Utensils} rotate={6} />
      <FloatIcon className="left-1/4 bottom-16" Icon={ChefHat} rotate={-4} />
    </div>
  );
}

function FloatIcon({
  Icon,
  className,
  rotate,
}: {
  Icon: typeof ChefHat;
  className?: string;
  rotate: number;
}) {
  return (
    <div
      className={cn(
        "absolute flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25",
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
    </div>
  );
}

export function RestaurantLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-500 to-accent-600",
        className,
      )}
    >
      <ChefHat className="h-7 w-7 text-white drop-shadow" strokeWidth={2} />
      <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white/35 blur-md" />
    </div>
  );
}
