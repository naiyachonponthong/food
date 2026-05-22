"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Flame, Check, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { QuantityStepper } from "@/components/QuantityStepper";
import { FoodImage } from "@/components/FoodImage";
import { getMenuById } from "@/lib/mock-data";
import { useCartStore, type SelectedOption } from "@/lib/cart-store";
import { cn, formatPrice } from "@/lib/utils";

export default function MenuDetailPage() {
  const params = useParams<{ token: string; id: string }>();
  const router = useRouter();
  const menu = getMenuById(params.id);
  const addToCart = useCartStore((s) => s.addToCart);

  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    menu?.options?.forEach((opt) => {
      const defaultChoice = opt.choices.find((c) => c.isDefault);
      if (defaultChoice) init[opt.id] = defaultChoice.id;
    });
    return init;
  });

  const selectedOptions: SelectedOption[] = useMemo(() => {
    if (!menu?.options) return [];
    return menu.options
      .map((opt) => {
        const chId = selected[opt.id];
        if (!chId) return null;
        const choice = opt.choices.find((c) => c.id === chId);
        if (!choice) return null;
        return { optionId: opt.id, optionName: opt.name, choice };
      })
      .filter((x): x is SelectedOption => x !== null);
  }, [menu, selected]);

  const totalPrice = useMemo(() => {
    if (!menu) return 0;
    const addons = selectedOptions.reduce(
      (s, o) => s + o.choice.priceAddon,
      0,
    );
    return (menu.price + addons) * qty;
  }, [menu, selectedOptions, qty]);

  const requiredOk =
    menu?.options?.every((opt) => !opt.isRequired || selected[opt.id]) ?? true;

  if (!menu) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-400">
        ไม่พบเมนู
      </div>
    );
  }

  const handleAdd = () => {
    if (!requiredOk) return;
    addToCart(menu, qty, selectedOptions, note.trim() || undefined);
    router.back();
  };

  return (
    <main className="min-h-screen pb-32">
      {/* Hero image */}
      <div className="relative h-[58vh] max-h-[420px]">
        <FoodImage menu={menu} size="xl" rounded="rounded-none" className="h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-cream-100" />

        <button
          onClick={() => router.back()}
          aria-label="ย้อนกลับ"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-soft"
          style={{ marginTop: "max(env(safe-area-inset-top), 0px)" }}
        >
          <ArrowLeft className="h-5 w-5 text-ink-800" />
        </button>

        <div
          className="absolute right-4 top-4 flex flex-col items-end gap-1.5"
          style={{ marginTop: "max(env(safe-area-inset-top), 0px)" }}
        >
          {menu.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-brand-500/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-soft"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Floating info card */}
      <div className="relative -mt-8 px-4">
        <div className="rounded-4xl bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold text-ink-800">
                {menu.name}
              </h1>
              <p className="text-sm text-ink-400">{menu.nameEn}</p>
            </div>
            {menu.spicyLevel && menu.spicyLevel >= 1 && (
              <div className="flex h-8 items-center gap-0.5 rounded-full bg-brand-50 px-2.5">
                {Array.from({ length: menu.spicyLevel }).map((_, i) => (
                  <Flame
                    key={i}
                    className="h-3.5 w-3.5 text-brand-500"
                    strokeWidth={2.5}
                    fill="currentColor"
                  />
                ))}
              </div>
            )}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-ink-500">
            {menu.description}
          </p>

          <div className="mt-4 flex items-center gap-4 text-sm text-ink-400">
            <div className="flex items-center gap-1.5">
              <span className="text-base">💰</span>
              <span className="font-semibold text-ink-700 tabular">
                {formatPrice(menu.price)}
              </span>
            </div>
            {menu.calories && (
              <div className="flex items-center gap-1.5">
                <span className="text-base">🔥</span>
                <span>{menu.calories} kcal</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="mt-4 space-y-3 px-4">
        {menu.options?.map((opt) => (
          <section
            key={opt.id}
            className="rounded-3xl bg-white p-5 shadow-soft"
          >
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-base font-semibold text-ink-800">
                {opt.name}
              </h3>
              {opt.isRequired ? (
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-brand-600">
                  ต้องเลือก
                </span>
              ) : (
                <span className="text-[10px] font-medium uppercase text-ink-400">
                  ตัวเลือก
                </span>
              )}
            </div>
            <div className="mt-3 space-y-2">
              {opt.choices.map((ch) => {
                const isSel = selected[opt.id] === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() =>
                      setSelected((prev) => ({ ...prev, [opt.id]: ch.id }))
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border-2 p-3 transition-all",
                      isSel
                        ? "border-brand-500 bg-brand-50/40"
                        : "border-cream-200 bg-cream-50 hover:border-cream-300",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border-2",
                          isSel
                            ? "border-brand-500 bg-brand-500 text-white"
                            : "border-cream-300 bg-white",
                        )}
                      >
                        {isSel && <Check className="h-3 w-3" strokeWidth={3.5} />}
                      </div>
                      <span className="text-sm font-medium text-ink-700">
                        {ch.name}
                      </span>
                    </div>
                    {ch.priceAddon > 0 && (
                      <span className="text-xs font-semibold text-brand-600 tabular">
                        +{formatPrice(ch.priceAddon)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {/* Note */}
        <section className="rounded-3xl bg-white p-5 shadow-soft">
          <h3 className="font-display text-base font-semibold text-ink-800">
            หมายเหตุถึงร้าน
          </h3>
          <p className="mt-0.5 text-xs text-ink-400">
            เช่น ไม่ใส่ผัก, ขอน้ำแข็งน้อย, ห่อกลับบ้าน
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="พิมพ์ข้อความเพิ่มเติม..."
            className="mt-3 w-full resize-none rounded-2xl border-2 border-cream-200 bg-cream-50 p-3 text-sm focus:border-brand-300 focus:outline-none"
          />
        </section>
      </div>

      {/* Sticky CTA */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
        className="fixed inset-x-0 bottom-0 z-30 pb-safe"
      >
        <div className="mx-auto max-w-md border-t border-cream-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <QuantityStepper value={qty} onChange={setQty} min={1} size="lg" />
            <button
              disabled={!requiredOk}
              onClick={handleAdd}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-white shadow-pop transition-all",
                requiredOk
                  ? "bg-brand-500 hover:bg-brand-600"
                  : "bg-ink-200 shadow-none",
              )}
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
              <span>เพิ่มลงตะกร้า</span>
              <span className="tabular">·</span>
              <span className="tabular">{formatPrice(totalPrice)}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
