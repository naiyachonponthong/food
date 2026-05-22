"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3, ShoppingBag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { QuantityStepper } from "@/components/QuantityStepper";
import { Sheet } from "@/components/Sheet";
import { FoodImage } from "@/components/FoodImage";
import { useCartStore, calcLineSubtotal } from "@/lib/cart-store";
import { getMenuById } from "@/lib/mock-data";
import { cn, formatPrice } from "@/lib/utils";

export default function CartPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const updateNote = useCartStore((s) => s.updateNote);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const subtotal = useCartStore((s) => s.cartSubtotal());
  const placeOrder = useCartStore((s) => s.placeOrder);

  const [editing, setEditing] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handlePlace = () => {
    const order = placeOrder();
    if (order) {
      setConfirmOpen(false);
      router.push(`/${params.token}/orders?placed=1`);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-cream-100">
        <Header back title="ตะกร้า" />
        <div className="flex flex-col items-center justify-center px-6 pt-24 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cream-200">
            <ShoppingBag className="h-12 w-12 text-ink-300" strokeWidth={1.5} />
          </div>
          <h2 className="mt-6 font-display text-xl font-semibold text-ink-700">
            ตะกร้าของคุณยังว่าง
          </h2>
          <p className="mt-2 text-sm text-ink-400">
            กลับไปเลือกเมนูที่ชอบกันก่อนสิครับ
          </p>
          <button
            onClick={() => router.push(`/${params.token}`)}
            className="mt-6 rounded-2xl bg-brand-500 px-8 py-3 font-semibold text-white shadow-pop"
          >
            ดูเมนู
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-100 pb-28">
      <Header back title="ตะกร้า" count={cart.length} />

      <div className="space-y-3 px-4 pt-3">
        <AnimatePresence initial={false}>
          {cart.map((item) => {
            const linePrice = calcLineSubtotal(item);
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="rounded-3xl bg-white p-4 shadow-soft"
              >
                <div className="flex gap-3">
                  <div className="h-20 w-20 flex-shrink-0">
                    {(() => {
                      const menu = getMenuById(item.menuId);
                      return menu ? (
                        <FoodImage menu={menu} size="md" rounded="rounded-2xl" className="h-full w-full" />
                      ) : (
                        <div className="h-full w-full rounded-2xl bg-cream-200" />
                      );
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-ink-800">
                        {item.name}
                      </h3>
                      <button
                        aria-label="ลบ"
                        onClick={() => removeFromCart(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-ink-400 hover:bg-cream-200 hover:text-brand-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {item.options.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.options.map((o) => (
                          <span
                            key={o.optionId}
                            className="rounded-full bg-cream-100 px-2 py-0.5 text-[10px] text-ink-500"
                          >
                            {o.choice.name}
                            {o.choice.priceAddon > 0 &&
                              ` (+${formatPrice(o.choice.priceAddon)})`}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.note && (
                      <div className="mt-1.5 line-clamp-2 text-xs italic text-ink-500">
                        “{item.note}”
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setEditing(item.id);
                      setDraftNote(item.note || "");
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-brand-600"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    แก้ไขหมายเหตุ
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-ink-800 tabular">
                      {formatPrice(linePrice)}
                    </span>
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(v) => updateQuantity(item.id, v)}
                      allowZero
                      size="md"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Subtotal summary */}
      <div className="mt-5 px-4">
        <div className="rounded-3xl bg-white p-5 shadow-soft">
          <h3 className="font-display text-base font-semibold text-ink-800">
            สรุปยอดก่อนสั่ง
          </h3>
          <p className="mt-0.5 text-xs text-ink-400">
            ยอดสุดท้ายรวม Service Charge / VAT จะคำนวณตอนเช็คบิล
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-dashed border-cream-300 pt-3 text-sm">
            <span className="text-ink-500">รวมรายการ ({cart.length})</span>
            <span className="font-bold text-ink-800 tabular">
              {formatPrice(subtotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 pb-safe">
        <div className="mx-auto max-w-md border-t border-cream-200 bg-white/95 px-4 py-3 backdrop-blur">
          <button
            onClick={() => setConfirmOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-brand-500 px-5 py-4 font-semibold text-white shadow-pop hover:bg-brand-600"
          >
            <span>สั่ง {cart.length} รายการ</span>
            <span className="tabular">{formatPrice(subtotal)}</span>
          </button>
        </div>
      </div>

      {/* Edit note sheet */}
      <Sheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title="หมายเหตุถึงร้าน"
        subtitle="เช่น ไม่ใส่ผัก, ขอน้ำแข็งน้อย"
        footer={
          <button
            onClick={() => {
              if (editing) updateNote(editing, draftNote);
              setEditing(null);
            }}
            className="w-full rounded-2xl bg-brand-500 py-4 font-semibold text-white shadow-pop"
          >
            บันทึก
          </button>
        }
      >
        <textarea
          autoFocus
          value={draftNote}
          onChange={(e) => setDraftNote(e.target.value)}
          rows={4}
          placeholder="พิมพ์ข้อความ..."
          className="w-full resize-none rounded-2xl border-2 border-cream-200 bg-white p-4 text-sm focus:border-brand-300 focus:outline-none"
        />
      </Sheet>

      {/* Confirm order */}
      <Sheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="ยืนยันการสั่งอาหาร"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className="flex-1 rounded-2xl border-2 border-cream-300 bg-white py-3.5 font-semibold text-ink-700"
            >
              ยกเลิก
            </button>
            <button
              onClick={handlePlace}
              className="flex-1 rounded-2xl bg-brand-500 py-3.5 font-semibold text-white shadow-pop"
            >
              ยืนยัน
            </button>
          </div>
        }
      >
        <div className="rounded-2xl bg-brand-50 p-4 text-sm text-brand-800">
          กรุณาตรวจสอบรายการให้เรียบร้อย เมื่อกดยืนยันแล้ว เครื่องครัวจะได้รับใบออเดอร์ทันที
        </div>
        <div className="mt-3 max-h-60 space-y-2 overflow-y-auto">
          {cart.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between rounded-xl bg-cream-100 px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-ink-700">
                  {it.quantity}× {it.name}
                </div>
                {it.options.length > 0 && (
                  <div className="truncate text-xs text-ink-400">
                    {it.options.map((o) => o.choice.name).join(" · ")}
                  </div>
                )}
              </div>
              <div className="ml-2 font-semibold text-ink-700 tabular">
                {formatPrice(calcLineSubtotal(it))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-ink-800 px-4 py-3 text-white">
          <span className="text-sm">รวมก่อนภาษี</span>
          <span className="text-lg font-bold tabular">
            {formatPrice(subtotal)}
          </span>
        </div>
      </Sheet>
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
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft"
            aria-label="ย้อนกลับ"
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
