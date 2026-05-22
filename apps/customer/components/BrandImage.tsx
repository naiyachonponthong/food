"use client";

import { cn } from "@/lib/utils";

export function RestaurantCover({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-gradient-to-br from-brand-300 via-brand-500 to-brand-700",
        className,
      )}
    >
      <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-amber-300/40 blur-3xl" />
      <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-rose-400/40 blur-3xl" />
      <div className="absolute right-10 top-20 h-40 w-40 rounded-full bg-yellow-200/40 blur-2xl" />
      {/* Subtle herb texture */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.6) 0%, transparent 30%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.5) 0%, transparent 30%)",
        }}
      />
      {/* Floating food emojis */}
      <div className="absolute right-6 top-12 text-5xl opacity-90 rotate-12">
        🍜
      </div>
      <div className="absolute left-8 top-24 text-4xl opacity-90 -rotate-12">
        🍤
      </div>
      <div className="absolute right-20 bottom-10 text-4xl opacity-90 rotate-6">
        🌶️
      </div>
      <div className="absolute left-1/4 bottom-16 text-3xl opacity-80">🍚</div>
    </div>
  );
}

export function RestaurantLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-400 to-brand-600",
        className,
      )}
    >
      <span className="text-3xl drop-shadow">🍳</span>
      <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-yellow-300/60 blur-md" />
    </div>
  );
}
